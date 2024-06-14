import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DailyOhlc } from './model/dailyOhlc.model';
import { IntradayOhlc } from './model/intradayOhlc.model';
import { CATEGORIES } from 'src/shared/utils/contants';
import { Roc } from './model/roc.model';
import { format, subMonths, subYears } from 'date-fns';
import { Op } from 'sequelize';
import { SsiService } from 'src/ssi/ssi.service';
import { Security } from 'src/ssi/model/security.model';
import { endpoints } from 'src/shared/utils/api';
import api from '../shared/utils/api';
import { Utils } from 'src/shared/utils/utils';
import { Category } from 'src/category/model/category.model';

@Injectable()
export class OhlcService {
  constructor(
    @InjectModel(DailyOhlc)
    private dailyOhlcModel: typeof DailyOhlc,
    @InjectModel(IntradayOhlc)
    private intradayOhlcModel: typeof IntradayOhlc,
    @InjectModel(Roc)
    private rocModel: typeof Roc,
    @InjectModel(Security)
    private securityModel: typeof Security,
    @InjectModel(Category)
    private categoryModel: typeof Category,
    private ssiServie: SsiService,
  ) {}
  private logger: Logger = new Logger('OHLC');

  dailyOhlcImported = [];
  intradayOhlcImported = [];
  roc = [];

  async updateDaily(chunkIndex): Promise<any> {
    const fetchData = async ({ symbol, pageIndex, headers }) => {
      let data, length;
      const lookupRequest = {
        symbol: symbol,
        fromDate: '01/01/2000',
        pageIndex: pageIndex,
        pageSize: 1000,
        ascending: true,
      };
      await api
        .get(
          endpoints.DAILY_OHLC +
            '?lookupRequest.symbol=' +
            lookupRequest.symbol +
            '&lookupRequest.fromDate=' +
            lookupRequest.fromDate +
            '&lookupRequest.pageIndex=' +
            lookupRequest.pageIndex +
            '&lookupRequest.pageSize=' +
            lookupRequest.pageSize +
            '&lookupRequest.ascending=' +
            lookupRequest.ascending,
          { headers },
        )
        .then((res) => {
          data = res.data.data;
          length = res.data.totalRecord;
          const formattedData = data.map((item) => {
            return {
              symbol: item.Symbol,
              time: Utils.convertToISODate(item.TradingDate),
              market: item.Market,
              open: item.Open,
              high: item.High,
              low: item.Low,
              close: item.Close,
              value: item.Value,
              volume: item.Volume,
            };
          });
          try {
            this.dailyOhlcModel.bulkCreate(formattedData, {
              ignoreDuplicates: true,
            });
          } catch (error) {
            console.log(error);
          }
        })
        .catch((e) => {
          console.log(e);
        });

      return { length };
    };

    const fetchDataEachSymbol = async ({ symbol, headers, length }) => {
      let pageIndex = 2;
      while ((pageIndex - 1) * 1000 < length) {
        fetchData({ symbol, pageIndex, headers });
        await Utils.sleep(1000);
        pageIndex++;
      }
    };

    const fetchDataLength = async ({ symbol, headers, pageIndex, parent }) => {
      const newData = await fetchData({ symbol, pageIndex, headers });
      parent[symbol] = newData.length;
    };

    const token = this.ssiServie.getToken();
    // const chunkSize = 100;
    // const chunks = [];
    const headers = {
      Authorization: token, // Thêm header Authorization
    };
    const securities = await this.securityModel.findAll({
      attributes: ['Symbol'],
    });
    const symbols = await securities.map((item) => {
      return item.Symbol;
    });
    // for (let i = 0; i < symbols.length; i += chunkSize) {
    //   chunks.push(symbols.slice(i, i + chunkSize));
    // }
    await this.dailyOhlcModel.truncate();

    const dataLengths: any = {};
    for (const symbol of symbols) {
      fetchDataLength({ symbol, headers, pageIndex: 1, parent: dataLengths });
      await Utils.sleep(1000);
    }
    console.log(dataLengths);

    for (const symbol of symbols) {
      await Utils.sleep(1000);
      await fetchDataEachSymbol({
        symbol,
        headers,
        length: dataLengths[symbol],
      });
    }
  }

  async importIntraday(data: any): Promise<any> {}

  async getDaily(symbol: string) {
    const ohlcs = await this.dailyOhlcModel.findAll({
      where: { symbol: symbol },
      order: [['time', 'ASC']],
    });
    return { length: ohlcs.length, data: ohlcs };
  }

  async getIntraday(ticker: string) {
    const ohlcs = await this.intradayOhlcModel.findAll({
      where: { ticker: ticker },
      order: [['time', 'ASC']],
    });
    return ohlcs;
  }

  async getRoc(startDate: Date, endDate: Date) {
    console.log(startDate, endDate);

    const rocs = await this.rocModel.findAll({
      order: [['time', 'ASC']],
      where: {
        time: {
          // [Op.gte]: format(startDate, 'yyyy-MM-dd'),
          [Op.between]: [startDate, endDate],
        },
      },
    });

    return rocs;
  }

  async importRoc(data) {
    if (data.at(-1).header === 'done') {
      data.pop();
      this.roc.push(...data);
      const newData = this.roc;
      this.roc = [];
      return await this.updateRoc(newData);
    } else {
      this.roc.push(...data);
    }
  }

  async updateRoc(data) {
    const categorizedStocks = await this.stockToCategoryMap(data);

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

  async stockToCategoryMap(stocks) {
    const categorizedStocksByCategory = {};
    const categories = await this.categoryModel.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          model: this.securityModel, // Assuming 'securitiesModel' exists
          as: 'Securities', // Optional alias for clarity (optional)
          attributes: ['Symbol'], // Include only the 'Symbol' attribute
        },
      ],
    });
    // console.log(categories[0].Securities[0].dataValues);

    // Khởi tạo các danh mục rỗng trong đối tượng kết quả
    categories.forEach((category) => {
      categorizedStocksByCategory[category.id] = [];
    });

    // Phân loại các phần tử của mảng

    stocks.forEach((stock) => {
      let found = false; // Biến cờ để kiểm soát luồng
      categories.forEach((category) => {
        if (found) return; // Nếu đã tìm thấy, thoát khỏi vòng lặp category
        category.Securities.forEach((security) => {
          if (found) return; // Nếu đã tìm thấy, thoát khỏi vòng lặp security
          if (security.Symbol === stock.ticker) {
            categorizedStocksByCategory[category.id].push({
              ticker: stock.ticker,
              time: stock.time,
              value: stock.close,
              displayName: category.name,
            });
            found = true; // Đặt cờ là true để thoát khỏi các vòng lặp lồng nhau
          }
        });
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

  getCurrentTime() {
    const now = new Date();
    return format(now, 'HH:mm:ss');
  }
}
