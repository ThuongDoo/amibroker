import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EventsGateway } from 'src/events/events.gateway';
import { Buysell } from './buysell.model';
import { OrderItem } from 'sequelize';
import { format, parse } from 'date-fns';
import { Op } from 'sequelize';
import { StockBuySell } from './stockBuysell.model';
import { deletedBuysell } from 'src/constant/deletedBuysell';

@Injectable()
export class StockService {
  constructor(
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,

    @InjectModel(Buysell)
    private buysellModel: typeof Buysell,

    @InjectModel(StockBuySell)
    private stockBuysellModel: typeof StockBuySell,
  ) {}
  stockData = [];
  buysellData = [];

  stockSan = [];

  tempData = '';

  buysellImported = [];

  async formatSan() {
    const sanArray = ['VNINDEX', 'VN30', 'HNXINDEX', 'HNX30', 'UPINDEX'];
    const sortArray = ['VNINDEX', 'VN30', 'HNX', 'HNX30', 'UPCOM'];

    const tempData = this.stockData;
    const filteredObjects = tempData
      .filter((obj) => sanArray.includes(obj.Ticker))
      .map((obj) => {
        let Ticker = obj.Ticker;
        if (Ticker === 'HNXINDEX') {
          Ticker = 'HNX';
        } else if (Ticker === 'UPINDEX') {
          Ticker = 'UPCOM';
        }
        return {
          Ticker,
          Giahientai: obj.Giahientai,
          'Tang/Giam': obj['Tang/Giam'],
          'Tang/Giam (%)': obj['Tang/Giam (%)'],
        };
      });

    function customSort(a, b) {
      return sortArray.indexOf(a.Ticker) - sortArray.indexOf(b.Ticker);
    }
    const sortedData = filteredObjects.sort(customSort);

    return sortedData;

    // Lặp qua mảng data để lọc và tính toán
  }

  getSan() {
    return this.stockSan;
  }

  formatData(csvData) {
    const convertToISO = (dateString) => {
      // Tạo một đối tượng Date từ chuỗi ngày tháng đầu vào
      try {
        // const parsedDate = parse(dateString, 'M/d/yyyy HH:mm:ss', new Date());
        // const isoString = formatISO(parsedDate);
        // console.log(isoString);
        const inputFormat = 'M/d/yyyy HH:mm:ss';
        const outputFormat = 'yyyy-MM-dd';
        const parsedDate = parse(dateString, inputFormat, new Date());

        // Chuyển đổi đối tượng Date thành chuỗi trong định dạng mong muốn
        const outputDateString = format(parsedDate, outputFormat);

        return outputDateString;
      } catch (error) {
        return dateString;
      }
    };
    const headers = csvData.split('\r\n')[0].split(',');

    // Tách các dòng còn lại thành mảng các đối tượng
    const dataArray = csvData.split('\r\n').slice(1);

    const result = dataArray
      .map((row) => {
        const values = row.split(',');
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index];
        });
        return obj;
      })
      .filter((row) => row.Ticker !== '' && row.Ticker !== undefined)
      .map((row) => {
        return {
          ...row,
          'Date/Time': convertToISO(row['Date/Time']),
          // date: row['Date/Time'],
        };
      });

    return result;
  }

  async getStocks() {
    const data = this.stockData.map((item) => item.Ticker);
    console.log('data', data);

    return data;
  }

  async getStockByName(stocks: string[]) {
    return this.stockData.filter((item) => stocks.includes(item.Ticker));
  }

  async sendStock() {
    this.stockData = await this.formatData(this.tempData);

    this.tempData = '';
    this.stockSan = await this.formatSan();

    await this.eventsGateway.sendStockUpdateSignal();
  }

  async updateStock(data) {
    if (data.data == 'done') {
      this.sendStock();
    } else {
      this.tempData += data.data;
    }
  }

  //BUYSELL

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
      const updatedData = await nonZeroStatusArray.map((item) => {
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

    const newData = this.formatData(data)
      .filter(
        (item) => item.Ticker !== '' && !deletedBuysell.includes(item.Ticker),
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
    const buysell = await this.stockBuysellModel.findAll({
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

    await this.stockBuysellModel.bulkCreate(mergedArray, {
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

    await this.eventsGateway.sendBuysellToAllClients(result.data);
  }

  async updateBuysell(data) {
    if (data.data == 'done') {
      this.sendBuysell();
    } else {
      this.buysellData += data.data;
    }
  }

  async filterBuysell(dateFilter: string, ticker: string, limit: string) {
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

    const buysell = await this.stockBuysellModel.findAll(options);
    // console.log(buysell);

    return { data: buysell };
  }

  async getBuysell() {
    const today = new Date();

    const buysell = [];

    const todayBuysell = await this.stockBuysellModel.findAll({
      where: { sortTime: today },
    });

    buysell.push(...todayBuysell);

    if (buysell.length < 20) {
      const temp = await this.stockBuysellModel.findAll({
        where: { sortTime: { [Op.lt]: today } },
        limit: 20 - buysell.length,
        order: [['sortTime', 'DESC']],
      });

      buysell.push(...temp);
    }

    return { data: buysell };
  }

  async importBuysell(data) {
    if (data[data.length - 1]?.header === 'done') {
      const pushData = data.slice(0, data.length - 1);
      this.buysellImported.push(...pushData);
      const newData = this.buysellImported;
      this.buysellImported = [];
      try {
        await this.stockBuysellModel.truncate();
        const results = await this.stockBuysellModel.bulkCreate(newData);
        console.log('imported file length: ', results.length);

        return results;
      } catch (error) {
        throw error;
      }
    } else {
      this.buysellImported.push(...data);
    }
  }

  //delete
  async updateMuaMoi() {
    const today = new Date();
    const buysells = await this.buysellModel.update(
      { status: 1 },
      {
        where: { date: today, status: 2 },
      },
    );
    return buysells.length;
  }
}
