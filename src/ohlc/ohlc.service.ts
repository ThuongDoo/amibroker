import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DailyOhlc } from './model/dailyOhlc.model';
import { IntradayOhlc } from './model/intradayOhlc.model';
import { CATEGORIES } from 'src/shared/utils/contants';
import { Roc } from './model/roc.model';
import {
  format,
  formatISO,
  parse,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import { Op } from 'sequelize';
import { SsiService } from 'src/ssi/ssi.service';
import { Security } from 'src/ssi/model/security.model';
import { endpoints } from 'src/shared/utils/api';
import api from '../shared/utils/api';
import { Utils } from 'src/shared/utils/utils';
import { Category } from 'src/category/model/category.model';
import { Cron } from '@nestjs/schedule';

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
    @Inject(forwardRef(() => SsiService))
    private readonly ssiService: SsiService,
  ) {}

  dailyOhlcImported = [];
  intradayOhlcImported = [];
  roc = [];

  async updateDaily(
    fromDate = '01/01/2000',
    isTruncate: boolean = true,
  ): Promise<any> {
    const fetchData = async ({
      symbol,
      pageIndex,
      headers,
    }): Promise<{
      data: any;
      length: any;
    }> => {
      let data, length;
      const lookupRequest = {
        symbol: symbol,
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
            fromDate +
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
        })
        .catch((e) => {
          console.log(e);
        });

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
      return { data, length };
    };

    const fetchDataEachSymbol = async ({
      symbol,
      headers,
      length,
    }): Promise<void> => {
      let pageIndex = 2;

      while ((pageIndex - 1) * 1000 < length) {
        await Utils.sleep(1000);
        fetchData({ symbol, pageIndex, headers });
        pageIndex++;
      }
    };

    const fetchDataLength = async ({
      symbol,
      headers,
      dataLengths,
    }): Promise<void> => {
      const data = await fetchData({ symbol, pageIndex: 1, headers });
      dataLengths[symbol] = data.length;
    };

    const dataLengths = {};
    const token = this.ssiService.getToken();
    const headers = {
      Authorization: token, // Thêm header Authorization
    };
    const securities = await this.securityModel.findAll({
      attributes: ['Symbol'],
    });
    const symbols = await securities.map((item) => {
      return item.Symbol;
    });
    if (isTruncate) {
      await this.dailyOhlcModel.truncate();
    }

    for (const symbol of symbols) {
      await fetchDataLength({ symbol, headers, dataLengths });
    }

    for (const symbol of symbols) {
      await fetchDataEachSymbol({
        symbol,
        headers,
        length: dataLengths[symbol],
      });
    }
  }

  async updateIntraday(
    fromDate: string,
    toDate: string,
    isTruncate: boolean = true,
  ): Promise<any> {
    const fetchData = async ({ symbol, pageIndex, headers }) => {
      let data, length;
      const lookupRequest = {
        symbol: symbol,
        pageIndex: pageIndex,
        pageSize: 1000,
        ascending: true,
      };
      await api
        .get(
          endpoints.INTRADAY_OHLC +
            '?lookupRequest.symbol=' +
            lookupRequest.symbol +
            '&lookupRequest.fromDate=' +
            fromDate +
            '&lookupRequest.toDate=' +
            toDate +
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
        })
        .catch((e) => {
          console.log(e);
        });

      const formattedData = data.map((item) => {
        const dateTimeString = `${item.TradingDate} ${item.Time}`;
        const parsedDate = parse(
          dateTimeString,
          'dd/MM/yyyy HH:mm:ss',
          new Date(),
        );
        return {
          symbol: item.Symbol,
          time: parsedDate,
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
        this.intradayOhlcModel.bulkCreate(formattedData, {
          ignoreDuplicates: true,
        });
      } catch (error) {
        console.log(error);
      }
      console.log(formattedData);

      return { data, length };
    };

    const fetchDataEachSymbol = async ({ symbol, headers, length }) => {
      let pageIndex = 2;

      while ((pageIndex - 1) * 1000 < length) {
        await Utils.sleep(1000);
        fetchData({ symbol, pageIndex, headers });
        pageIndex++;
      }
    };

    const fetchDataLength = async ({
      symbol,
      headers,
      dataLengths,
    }): Promise<void> => {
      const data = await fetchData({ symbol, pageIndex: 1, headers });
      dataLengths[symbol] = data.length;
    };

    const token = this.ssiService.getToken();
    const dataLengths = {};

    const headers = {
      Authorization: token, // Thêm header Authorization
    };
    const securities = await this.securityModel.findAll({
      attributes: ['Symbol'],
    });
    const symbols = await securities.map((item) => {
      return item.Symbol;
    });
    if (isTruncate) await this.intradayOhlcModel.truncate();

    for (const symbol of symbols) {
      await fetchDataLength({ symbol, headers, dataLengths });
    }

    for (const symbol of symbols) {
      await fetchDataEachSymbol({
        symbol,
        headers,
        length: dataLengths[symbol],
      });
    }
  }

  async getDaily(symbol: string) {
    const ohlcs = await this.dailyOhlcModel.findAll({
      where: { symbol: symbol },
      order: [['time', 'ASC']],
    });

    return { length: ohlcs.length, data: ohlcs };
  }

  async getIntraday(symbol: string) {
    const ohlcs = await this.intradayOhlcModel.findAll({
      where: { symbol: symbol },
      order: [['time', 'ASC']],
    });
    return { length: ohlcs.length, data: ohlcs };
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

  async updateRoc(isTruncate: boolean = true, isDaily: boolean = false) {
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

    const startDate = new Date();
    if (!isDaily) startDate.setFullYear(startDate.getFullYear() - 5);

    const categorizedStocks = [];
    for (const category of categories) {
      const securities = category.Securities.map((item) => {
        return item.Symbol;
      });

      const ohlcs = await this.dailyOhlcModel.findAll({
        where: {
          symbol: {
            [Op.in]: securities,
          },
          time: {
            [Op.gte]: startDate,
          },
        },
      });
      const ohlcsValues = ohlcs.map((item) => {
        return {
          category: category.id,
          value: item.close,
          displayName: category.name,
          time: formatISO(new Date(item.time)),
        };
      });
      categorizedStocks.push({ category: category.id, data: ohlcsValues });
    }

    const averageStocksByTime = categorizedStocks
      .map((item) => {
        const roc = this.groupAndAverageStocksByTime(item);
        return roc;
      })
      .flat();
    try {
      if (isTruncate) await this.rocModel.truncate();
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
      return { length: results.length, data: results };
    } catch (error) {
      throw error;
    }
  }

  updateOneIntraday(item) {
    const dateTimeString = `${item.TradingDate} ${item.Time}`;
    const parsedDate = parse(dateTimeString, 'dd/MM/yyyy HH:mm:ss', new Date());
    this.intradayOhlcModel.create(
      {
        symbol: item.Symbol,
        time: parsedDate,
        open: item.Open,
        high: item.High,
        low: item.Low,
        close: item.Close,
        volume: item.Volume,
        value: item.Value,
      },
      { ignoreDuplicates: true },
    );
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
        const value = totalRoc / count;
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

  @Cron('0 10 * * *')
  async handleCron() {
    await this.updateRoc(false, true);

    // Thực hiện các hành động bạn muốn ở đây
  }
}
