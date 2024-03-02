import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EventsGateway } from 'src/events/events.gateway';
import { Buysell } from './buysell.model';
import { OrderItem } from 'sequelize';
import { format, parse } from 'date-fns';
import { Op } from 'sequelize';

@Injectable()
export class StockService {
  constructor(
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,

    @InjectModel(Buysell)
    private buysellModel: typeof Buysell,
  ) {}
  stockData = [];
  buysellData = [];

  tempData = '';

  buysellImported = [];

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

  async updateBuysell(data) {
    console.log('buysell');
    const today = new Date();

    const formattedToday = format(today, 'yyyy-MM-dd');

    const newData = this.formatData(data.data)
      .filter(
        (item) => item.Ticker !== '' && item['Date/Time'] === formattedToday,
      )
      .map((item) => {
        return {
          ticker: item.Ticker,
          date: item['Date/Time'],
          price: item.Close,
          status: item['Mua - Ban'],
        };
      });

    const buysells = await this.buysellModel.findAll({
      where: { date: formattedToday },
    });

    const filteredData = newData
      .filter(
        (itemA) => !buysells.some((itemB) => itemB.ticker === itemA.ticker),
      )
      .map((item) => {
        return { ...item, status: item.status == 1 ? 2 : 0 };
      });

    const createdData = await this.buysellModel.bulkCreate(filteredData);
    // delete
    console.log(createdData);

    const todayBuysell = [];
    todayBuysell.push(...buysells);
    todayBuysell.push(...filteredData);

    if (todayBuysell.length < 20) {
      const temp = await this.buysellModel.findAll({
        where: { date: { [Op.lt]: formattedToday } },
        limit: 20 - todayBuysell.length,
      });
      todayBuysell.push(...temp);
    }

    // console.log(this.buysellData);

    //filterBuysell

    // Định dạng ngày thành chuỗi "yyyy-MM-dd"

    this.buysellData = todayBuysell;
    await this.eventsGateway.sendBuysellToAllClients(this.buysellData);
  }

  async getBuysell(dateFilter: string, ticker: string, limitNumber: string) {
    let whereCondition = {}; // Điều kiện tìm kiếm mặc định là trống

    // Nếu dateFilter hoặc ticker không null, thêm điều kiện tìm kiếm tương ứng
    if (dateFilter !== undefined) {
      whereCondition = { ...whereCondition, date: dateFilter };
    }

    if (ticker !== undefined) {
      whereCondition = { ...whereCondition, ticker: ticker };
    }
    const options = {
      where: whereCondition,
      order: [['date', 'DESC']] as OrderItem[], // Sắp xếp theo ngày mới nhất
    };

    if (limitNumber !== undefined) {
      options['limit'] = Number(limitNumber);
    }
    const realtimeData = await this.getBuysellProfitRealtime();
    const buysell = await this.buysellModel.findAll(options);
    return { data: buysell, realtimeData };
  }

  async importBuysell(data) {
    if (data[data.length - 1]?.header === 'done') {
      const pushData = data.slice(0, data.length - 1);
      this.buysellImported.push(...pushData);
      const newData = this.buysellImported;
      this.buysellImported = [];
      try {
        await this.buysellModel.truncate();
        const results = await this.buysellModel.bulkCreate(newData);

        return results.length;
      } catch (error) {
        throw error;
      }
    } else {
      this.buysellImported.push(...data);
    }
  }

  async getBuysellProfitRealtime() {
    return this.stockData.map((item) => {
      return {
        ticker: item.Ticker,
        date: item['Date/Time'],
        price: item.Giahientai,
      };
    });
  }
}
