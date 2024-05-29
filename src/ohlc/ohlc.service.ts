import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DailyOhlc } from './dailyOhlc.model';
import { IntradayOhlc } from './intradayOhlc.model';
import { CATEGORIES } from 'src/shared/utils/contants';
import { Roc } from './roc.model';
import { format, subMonths, subYears } from 'date-fns';
import { Op } from 'sequelize';

@Injectable()
export class OhlcService {
  constructor(
    @InjectModel(DailyOhlc)
    private dailyOhlcModel: typeof DailyOhlc,
    @InjectModel(IntradayOhlc)
    private intradayOhlcModel: typeof IntradayOhlc,
    @InjectModel(Roc)
    private rocModel: typeof Roc,
  ) {}

  dailyOhlcImported = [];
  intradayOhlcImported = [];

  async importDaily(data: any): Promise<any> {
    if (data[data.length - 1]?.header === 'done') {
      const pushData = data.slice(0, data.length - 1);
      this.dailyOhlcImported.push(...pushData);
      const newData = this.dailyOhlcImported;

      this.dailyOhlcImported = [];
      this.updateRoc(newData);
      try {
        await this.dailyOhlcModel.truncate();
        const chunkSize = 2000; // Số lượng mục mỗi chunk
        const totalData = newData.length;
        let startIndex = 0;
        let results = [];
        while (startIndex < totalData) {
          const chunkData = newData.slice(startIndex, startIndex + chunkSize);
          const chunkResults = await this.dailyOhlcModel.bulkCreate(chunkData, {
            ignoreDuplicates: true,
          });
          results = results.concat(chunkResults);
          startIndex += chunkSize;
        }
        console.log('imported file length: ', results.length);
        return results;
      } catch (error) {
        throw error;
      }
    } else {
      this.dailyOhlcImported.push(...data);
    }
  }

  async importIntraday(data: any): Promise<any> {
    if (data[data.length - 1]?.header === 'done') {
      const pushData = data.slice(0, data.length - 1);
      this.intradayOhlcImported.push(...pushData);
      const newData = this.intradayOhlcImported;
      this.intradayOhlcImported = [];
      try {
        await this.intradayOhlcModel.truncate();
        const chunkSize = 2000; // Số lượng mục mỗi chunk
        const totalData = newData.length;
        let startIndex = 0;
        let results = [];

        while (startIndex < totalData) {
          const chunkData = newData.slice(startIndex, startIndex + chunkSize);
          const chunkResults = await this.intradayOhlcModel.bulkCreate(
            chunkData,
            {
              ignoreDuplicates: true,
            },
          );
          results = results.concat(chunkResults);
          startIndex += chunkSize;
        }

        console.log('imported file length: ', results.length);
        return results;
      } catch (error) {
        throw error;
      }
    } else {
      this.intradayOhlcImported.push(...data);
    }
  }

  async getDaily(ticker: string) {
    console.log(ticker);

    const ohlcs = await this.dailyOhlcModel.findAll({
      where: { ticker: ticker },
      order: [['time', 'ASC']],
    });
    return ohlcs;
  }

  async getIntraday(ticker: string) {
    console.log(ticker);

    const ohlcs = await this.intradayOhlcModel.findAll({
      where: { ticker: ticker },
      order: [['time', 'ASC']],
    });
    return ohlcs;
  }

  async updateDaily(data: any) {
    console.log(data);
  }

  async updateIntraday(data: any) {}

  async getRoc(timeRange: any) {
    let startDate: Date;

    // Tính toán ngày bắt đầu dựa trên timeRange
    switch (timeRange) {
      case '6m':
        startDate = subMonths(new Date(), 6);
        break;
      case '1y':
        startDate = subYears(new Date(), 1);
        break;
      case '2y':
        startDate = subYears(new Date(), 2);
        break;
      case '5y':
        startDate = subYears(new Date(), 5);
        break;
      default:
        throw new Error('Invalid time range');
    }
    const rocs = await this.rocModel.findAll({
      order: [['time', 'ASC']],
      where: {
        time: {
          [Op.gte]: format(startDate, 'yyyy-MM-dd'),
        },
      },
    });

    return rocs;
  }

  async updateRoc(data) {
    const categorizedStocks = this.stockToCategoryMap(data);

    const averageStocksByTime = categorizedStocks
      .map((item) => {
        const roc = this.groupAndAverageStocksByTime(item);
        return roc;
      })
      .flat();

    try {
      await this.rocModel.truncate();
      const chunkSize = 2000; // Số lượng mục mỗi chunk
      const totalData = averageStocksByTime.length;
      let startIndex = 0;
      let results = [];
      while (startIndex < totalData) {
        const chunkData = averageStocksByTime.slice(
          startIndex,
          startIndex + chunkSize,
        );
        const chunkResults = await this.rocModel.bulkCreate(chunkData, {
          ignoreDuplicates: true,
        });
        results = results.concat(chunkResults);
        startIndex += chunkSize;
      }
      console.log('imported file length: ', results.length);
      return results;
    } catch (error) {
      throw error;
    }
  }

  groupAndAverageStocksByTime(item) {
    const timeMap = {};

    // Group stocks by time and accumulate their values
    item.data.forEach((stock) => {
      const { time, value } = stock;
      if (!timeMap[time]) {
        timeMap[time] = { totalRoc: 0, count: 0 };
      }
      timeMap[time].totalRoc += value;
      timeMap[time].count += 1;
    });

    // Calculate the average value for each time period
    const aggregatedStocks = [];
    for (const time in timeMap) {
      if (timeMap.hasOwnProperty(time)) {
        const { totalRoc, count } = timeMap[time];
        const value = totalRoc;
        aggregatedStocks.push({
          category: item.category,
          displayName: item.data[0].displayName,
          time,
          value,
        });
      }
    }

    return aggregatedStocks;
  }

  stockToCategoryMap(stocks) {
    const categorizedStocksByCategory = {};

    // Khởi tạo các danh mục rỗng trong đối tượng kết quả
    CATEGORIES.forEach((category) => {
      categorizedStocksByCategory[category.name] = [];
    });

    // Phân loại các phần tử của mảng
    stocks.forEach((stock) => {
      CATEGORIES.forEach((category) => {
        if (category.stocks.includes(stock.ticker)) {
          categorizedStocksByCategory[category.name].push({
            ticker: stock.ticker,
            time: stock.time,
            value: stock.close,
            displayName: category.displayName,
          });
        }
      });
    });
    const arrayFromObject = Object.entries(categorizedStocksByCategory).map(
      ([category, data]) => ({
        category,
        data,
      }),
    );

    return arrayFromObject;
  }

  //TODO: delete

  async removeSecondsBulk(instances: IntradayOhlc[]) {
    for (const instance of instances) {
      instance.time = this.adjustTime(instance.time);
    }
  }

  adjustTime(time: Date): Date {
    const newTime = new Date(time);
    newTime.setSeconds(0, 0); // Đặt giây và mili giây thành 0
    return newTime;
  }
}
