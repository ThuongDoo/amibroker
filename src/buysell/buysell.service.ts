import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Buysell } from './buysell.model';
import { EventsGateway } from 'src/events/events.gateway';
import { Utils } from 'src/shared/utils/utils';
import { DELETED_BUYSELL } from 'src/shared/utils/contants';
import { isSameDay } from 'date-fns';
import { Op, OrderItem } from 'sequelize';

@Injectable()
export class BuysellService {
  constructor(
    @InjectModel(Buysell)
    private buysellModel: typeof Buysell,

    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
  ) {}

  buysellData = [];
  buysellImported = [];

  async sendBuysell() {
    const filterNotFoundWithNonNullStatus = async (newData, buysell) => {
      // Lọc ra các phần tử không tìm thấy trong buysell
      const notFoundInBuySell = await newData.filter(
        (newItem) =>
          !buysell.some((buySellItem) => buySellItem.ticker === newItem.ticker),
      );

      // Lọc ra các phần tử có status không phải null
      const notFoundInBuySellFiltered = await notFoundInBuySell
        .filter((item) => item.status !== null)
        .map((item) => {
          return { ...item, status: 3, sortTime: item.knTime };
        });

      return notFoundInBuySellFiltered;
    };

    const updateBuy = async (stocks) => {
      const status0Array = await stocks.filter(
        (item) => item.buysell.status === 0,
      );

      const createdData = await status0Array.map((item) => {
        return {
          ...item.newData, // Giữ nguyên các thuộc tính khác của newData
          status: 3, // Gán status = 3
          sortTime: item.newData.knTime,
        };
      });

      const nonZeroStatusArray = await stocks.filter(
        (item) => item.buysell.status !== 0,
      );

      const updatedData = await nonZeroStatusArray.map((item) => {
        return {
          ...item.buysell, // Giữ nguyên các thuộc tính của buysell
          createdAt: undefined, // Loại bỏ thuộc tính createdAt
          updatedAt: undefined, // Loại bỏ thuộc tính updatedAt
          profit: item.newData.profit, // Gán profit = newData.profit
          buyPrice: item.newData.buyPrice,
          knTime: item.newData.knTime,
          holdingDuration: item.newData.holdingDuration,
          status: 3,
        };
      });

      const mergedData = [...createdData, ...updatedData];

      return mergedData;
    };
    const updateSell = async (stocks) => {
      // const nonZeroStatusArray = await stocks.filter(
      //   (item) => item.buysell.status !== 0,
      // );

      const updatedData = await stocks.map((item) => {
        return {
          ...item.buysell, // Giữ nguyên các thuộc tính của buysell
          createdAt: undefined, // Loại bỏ thuộc tính createdAt
          updatedAt: undefined, // Loại bỏ thuộc tính updatedAt
          profit: item.newData.profit, // Gán profit = newData.profit
          sellTime: item.newData.knTime,
          sortTime: item.newData.knTime,
          holdingDuration: item.newData.holdingDuration,
          sellPrice: item.newData.buyPrice,
          status: 0,
        };
      });

      return updatedData;
    };
    const updateNull = async (stocks) => {
      // console.log(stocks);
      const nonZeroStatusArray = await stocks.filter(
        (item) => item.buysell.status !== 0,
      );
      const filteredArray = [];
      await Promise.all(
        nonZeroStatusArray.map(async (item) => {
          if (isSameDay(item.buysell.knTime, item.newData.knTime)) {
            await this.buysellModel.destroy({
              where: { id: item.buysell.id },
            });
          } else {
            filteredArray.push(item);
          }
        }),
      );
      const updatedData = await filteredArray.map((item) => {
        return {
          ...item.buysell, // Giữ nguyên các thuộc tính của buysell
          createdAt: undefined, // Loại bỏ thuộc tính createdAt
          updatedAt: undefined, // Loại bỏ thuộc tính updatedAt
          profit: item.newData.profit, // Gán profit = newData.profit
          holdingDuration: item.newData.holdingDuration,
          status: 2,
        };
      });

      return updatedData;
    };
    const data = this.buysellData;

    this.buysellData = [];
    // const today = new Date();

    // const formattedToday = format(today, 'yyyy-MM-dd');

    const newData = Utils.formatData(data)
      .filter(
        (item) => item.Ticker !== '' && !DELETED_BUYSELL.includes(item.Ticker),
        // item['Date/Time'] === formattedToday,
      )
      .map((item) => {
        return {
          ticker: item.Ticker,
          knTime: item['Date/Time'],
          profit: Number(item['Lai/lo%']),
          buyPrice: Number(item['Giamua/ban']),
          holdingDuration: Number(item['T ']),
          status: item['Mua-Ban'] === '' ? null : Number(item['Mua-Ban']),
        };
      });

    const tickerArray = newData.map((item) => item.ticker);

    // lấy tất cả ticker
    const buysell = await this.buysellModel.findAll({
      where: { ticker: tickerArray },
      order: [['sortTime', 'DESC']],
    });

    // Lặp qua từng phần tử trong newData
    const combinedData = [];

    // Lặp qua từng phần tử trong newData
    newData.forEach((newItem) => {
      // Tìm phần tử trong buysell có cùng ticker
      const correspondingBuySell = buysell.find(
        (buySellItem) => buySellItem.ticker === newItem.ticker,
      );

      // Nếu tìm thấy phần tử trong buysell có cùng ticker
      if (correspondingBuySell) {
        // Tạo một đối tượng mới kết hợp dữ liệu từ cả hai mảng
        const combinedItem = {
          newData: newItem,
          buysell: correspondingBuySell?.dataValues,
        };
        // Thêm đối tượng mới vào mảng combinedData
        combinedData.push(combinedItem);
      }
    });

    // Lọc ra các trường hợp không tìm thấy phần tử cùng ticker trong buysell
    const notFoundInBuySellFiltered = await filterNotFoundWithNonNullStatus(
      newData,
      buysell,
    );

    const status0Group = [];
    const status1Group = [];
    const nullStatusGroup = [];

    // Duyệt qua mỗi phần tử trong combinedData
    combinedData.forEach((item) => {
      // Tùy thuộc vào giá trị của newData.status, thêm phần tử vào nhóm tương ứng
      if (item.newData.status === null) {
        nullStatusGroup.push(item);
      } else if (item.newData.status === 0) {
        status0Group.push(item);
      } else {
        status1Group.push(item);
      }
    });

    const updatedBuy = await updateBuy(status1Group);
    const updatedSell = await updateSell(status0Group);
    const updatedNull = await updateNull(nullStatusGroup);

    const mergedArray = [
      ...updatedBuy,
      ...updatedSell,
      ...updatedNull,
      ...notFoundInBuySellFiltered,
    ];

    await this.buysellModel.bulkCreate(mergedArray, {
      updateOnDuplicate: [
        'knTime',
        'buyPrice',
        'sellTime',
        'sortTime',
        'sellPrice',
        'profit',
        'holdingDuration',
        'risk',
        'status',
      ],
    });

    const result = await this.getBuysell();

    await this.eventsGateway.sendBuysellToClient(result.data);
  }

  async getBuysell() {
    const today = new Date();

    const buysell = [];

    const todayBuysell = await this.buysellModel.findAll({
      where: { sortTime: today },
    });

    buysell.push(...todayBuysell);

    if (buysell.length < 20) {
      const temp = await this.buysellModel.findAll({
        where: { sortTime: { [Op.lt]: today } },
        limit: 20 - buysell.length,
        order: [['sortTime', 'DESC']],
      });

      buysell.push(...temp);
    }

    return { data: buysell };
  }

  async filterBuysell(dateFilter: string, ticker: string, limit: string) {
    if (
      dateFilter === undefined &&
      ticker === undefined &&
      limit === undefined
    ) {
      console.log('hihi');

      return this.getBuysell();
    } else {
      let whereCondition = {}; // Điều kiện tìm kiếm mặc định là trống

      // Nếu dateFilter hoặc ticker không null, thêm điều kiện tìm kiếm tương ứng
      if (dateFilter !== undefined) {
        whereCondition = { ...whereCondition, sortTime: dateFilter };
      }

      if (ticker !== undefined) {
        whereCondition = { ...whereCondition, ticker: ticker };
      }

      let limitNumber = null;

      if (limit !== undefined) {
        limitNumber = parseInt(limit, 10);
      }

      const options = {
        where: whereCondition,
        order: [['sortTime', 'DESC']] as OrderItem[], // Sắp xếp theo ngày mới nhất
        limit: limitNumber,
      };

      const buysell = await this.buysellModel.findAll(options);
      // console.log(buysell);

      return { data: buysell };
    }
  }

  async updateBuysell(data) {
    if (data.data == 'done') {
      this.sendBuysell();
    } else {
      this.buysellData += data.data;
    }
  }

  async importBuysell(data) {
    if (data[data.length - 1]?.header === 'done') {
      const pushData = data.slice(0, data.length - 1);
      this.buysellImported.push(...pushData);
      const newData = this.buysellImported;
      this.buysellImported = [];
      try {
        await this.buysellModel.truncate();
        const chunkSize = 2000; // Số lượng mục mỗi chunk
        const totalData = newData.length;
        let startIndex = 0;
        let results = [];

        while (startIndex < totalData) {
          const chunkData = newData.slice(startIndex, startIndex + chunkSize);
          const chunkResults = await this.buysellModel.bulkCreate(chunkData);
          results = results.concat(chunkResults);
          startIndex += chunkSize;
        }

        console.log('imported file length: ', results.length);
        return results;
      } catch (error) {
        throw error;
      }
    } else {
      this.buysellImported.push(...data);
    }
  }
}
