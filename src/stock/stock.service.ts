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

  formatSan() {
    console.log('formatsan');
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

    this.stockSan = sortedData;

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
    return data;
  }

  async getStockByName(stocks: string[]) {
    return this.stockData.filter((item) => stocks.includes(item.Ticker));
  }

  async sendStock() {
    this.stockData = this.formatData(this.tempData);
    this.tempData = '';
    this.formatSan();
    console.log('Data length: ', this.stockData.length);

    await this.eventsGateway.sendStockUpdateSignal();
  }

  async updateStock(data) {
    console.log('update stock');
    if (data.data == 'done') {
      this.sendStock();
    } else {
      this.tempData += data.data;
    }
  }

  //BUYSELL

  async sendBuysell() {
    const filterSellSignal = (sellSignalData, buysell) => {
      for (const newItem of sellSignalData) {
        // Tìm bản ghi từ buysell có cùng ticker với newItem
        const matchedBuysell = buysell.find(
          (item) => item.ticker === newItem.ticker,
        );
        if (matchedBuysell) {
          const tempData = newItem;

          // Gán id từ buysell cho newItem

          newItem.id = matchedBuysell.id;
          newItem.knTime = matchedBuysell.knTime;
          newItem.buyPrice = matchedBuysell.buyPrice;
          newItem.sellPrice = tempData.buyPrice;
          newItem.sellTime = tempData.knTime;
          newItem.sortTime = tempData.knTime;
        }
      }
      return sellSignalData.filter((item) => item.id !== null);
    };
    const filterNoSignal = (noSignalData, buysell) => {
      for (const newItem of noSignalData) {
        // Tìm bản ghi từ buysell có cùng ticker với newItem
        const matchedBuysell = buysell.find(
          (item) => item.ticker === newItem.ticker,
        );
        if (matchedBuysell) {
          // Gán id từ buysell cho newItem

          newItem.id = matchedBuysell.id;
          newItem.knTime = matchedBuysell.knTime;
          newItem.buyPrice = matchedBuysell.buyPrice;
          newItem.sellPrice = null;
          newItem.sellTime = null;
          newItem.sortTime = matchedBuysell.knTime;
          newItem.status = matchedBuysell.status;
        }
      }
      return noSignalData.filter((item) => item.id !== null);
    };
    const data = this.buysellData;

    this.buysellData = [];
    const today = new Date();

    const formattedToday = format(today, 'yyyy-MM-dd');

    const newData = this.formatData(data)
      .filter(
        (item) =>
          item.Ticker !== '' &&
          !deletedBuysell.includes(item.Ticker) &&
          item['Date/Time'] === formattedToday,
      )
      .map((item) => {
        return {
          ticker: item.Ticker,
          knTime: item['Date/Time'],
          profit: Number(item['Lai/lo%']),
          buyPrice: Number(item['Giamua/ban']),
          holdingDuration: Number(item['T ']),
          status: item['Mua-Ban'] === '' ? null : Number(item['Mua-Ban']),
          id: null,
          sellTime: null,
          sellPrice: null,
          sortTime: item['Date/Time'],
        };
      });
    const tickerArray = newData.map((item) => item.ticker);
    // lấy tất cả ticker
    const buysell = await this.stockBuysellModel.findAll({
      where: { ticker: tickerArray },
      order: [['sortTime', 'DESC']],
    });

    //lọc phần tử có id

    const buySignalData = newData.filter((item) => item.status === 1);
    // Duyệt qua từng phần tử trong newData để gán id
    let sellSignalData = newData.filter((item) => item.status === 0);
    let noSignalData = newData.filter((item) => item.status === null);

    sellSignalData = filterSellSignal(sellSignalData, buysell);
    await this.stockBuysellModel.bulkCreate(sellSignalData, {
      updateOnDuplicate: ['id'],
    });

    noSignalData = filterNoSignal(noSignalData, buysell);
    await this.stockBuysellModel.bulkCreate(noSignalData, {
      updateOnDuplicate: ['id'],
    });

    await this.stockBuysellModel.bulkCreate(buySignalData);

    const result = await this.getBuysell();
    console.log(result.data);

    await this.eventsGateway.sendBuysellToAllClients(result.data);
  }

  async updateBuysell(data) {
    console.log('update buysell');
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
        console.log(results.length);

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
    console.log(buysells);
    return buysells.length;
  }
}
