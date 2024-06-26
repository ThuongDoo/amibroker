import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DailyOhlc } from './model/dailyOhlc.model';
import { IntradayOhlc } from './model/intradayOhlc.model';
import { Roc } from './model/roc.model';
import {
  format,
  formatISO,
  parse,
  setMilliseconds,
  setSeconds,
} from 'date-fns';
import { Op } from 'sequelize';
import { SsiService } from 'src/ssi/ssi.service';
import { Security } from 'src/ssi/model/security.model';
import { endpoints } from 'src/shared/utils/api';
import api from '../shared/utils/api';
import { Utils } from 'src/shared/utils/utils';
import { Category } from 'src/category/model/category.model';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Index } from 'src/ssi/model/index.model';
import { EventsGateway } from 'src/events/events.gateway';

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
    @InjectModel(Index)
    private indexModel: typeof Index,
    @Inject(forwardRef(() => SsiService))
    private readonly ssiService: SsiService,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
  ) {}

  private logger: Logger = new Logger('OhlcService');

  intradayData = {};
  dailyData = {};

  async importDaily(
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
      let data = [],
        length;
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
          if (data === null) {
            length = 0;
          } else {
            length = res.data.totalRecord;
            const formattedData = data?.map((item) => {
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
          }
        })
        .catch((e) => {
          console.log(e);
        });
      this.logger.log(`daily import ${symbol}`);

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
      fetchDataLength({ symbol, headers, dataLengths });
      await Utils.sleep(1000);
    }

    for (const symbol of symbols) {
      await fetchDataEachSymbol({
        symbol,
        headers,
        length: dataLengths[symbol],
      });
    }
  }

  async importIntraday(
    fromDate: string,
    toDate: string,
    isTruncate: boolean = true,
  ): Promise<any> {
    const fetchData = async ({ symbol, pageIndex, headers }) => {
      let data = [],
        length;
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
          if (data === null) {
            length = 0;
          } else {
            length = res.data.totalRecord;
            const formattedData = data?.map((item) => {
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
          }
        })
        .catch((e) => {
          console.log(e);
        });
      this.logger.log(`intraday import ${symbol}`);

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
      fetchDataLength({ symbol, headers, dataLengths });
      await Utils.sleep(1000);
    }

    for (const symbol of symbols) {
      await fetchDataEachSymbol({
        symbol,
        headers,
        length: dataLengths[symbol],
      });
    }
  }

  async getDaily(symbol: string, newest: boolean = false) {
    if (newest) {
      const ohlcs = await this.dailyOhlcModel.findOne({
        where: { symbol: symbol },
        order: [['time', 'DESC']],
      });
      return { data: ohlcs };
    } else {
      const ohlcs = await this.dailyOhlcModel.findAll({
        where: { symbol: symbol },
        order: [['time', 'ASC']],
      });

      return { length: ohlcs.length, data: ohlcs };
    }
  }

  async getIntraday(symbol: string, newest: boolean = false) {
    if (newest) {
      const ohlcs = await this.intradayOhlcModel.findOne({
        where: { symbol: symbol },
        order: [['time', 'DESC']],
      });
      return { data: ohlcs };
    } else {
      const ohlcs = await this.intradayOhlcModel.findAll({
        where: { symbol: symbol },
        order: [['time', 'ASC']],
      });
      return { length: ohlcs.length, data: ohlcs };
    }
  }

  async getRoc(startDate: Date, endDate: Date) {
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
    const tempCategories = await this.categoryModel.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          model: this.securityModel, // Assuming 'securitiesModel' exists
          as: 'Securities', // Optional alias for clarity (optional)
          attributes: ['Symbol'], // Include only the 'Symbol' attribute
        },
      ],
    });

    const indices = await this.indexModel.findOne({
      where: { indexCode: 'VNINDEX' },
      include: [
        {
          model: this.securityModel, // Assuming 'securitiesModel' exists
          as: 'Securities', // Optional alias for clarity (optional)
          attributes: ['Symbol'], // Include only the 'Symbol' attribute
        },
      ],
    });
    const vnindex = {
      id: indices.IndexCode,
      name: indices.IndexName,
      Securities: indices.Securities,
    };

    const categories = [...tempCategories, vnindex];

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
      this.logger.log('ROC import');
      return { length: results.length, data: results };
    } catch (error) {
      throw error;
    }
  }

  updateOneIntraday(item) {
    const dateTimeString = `${item.TradingDate} ${item.Time}`;
    const parsedDate = parse(dateTimeString, 'dd/MM/yyyy HH:mm:ss', new Date());
    const dateWithZeroSeconds = setMilliseconds(setSeconds(parsedDate, 0), 0);

    let oldData = this.intradayData[item.Symbol];
    if (oldData) {
      if (oldData.high < item.High) {
        oldData.high = item.High;
      }
      if (oldData.low > item.Low) {
        oldData.low = item.Low;
      }
      oldData.close = item.Close;
      oldData.volume = item.Volume;
      oldData.value = item.Value;
    } else {
      oldData = {
        symbol: item.Symbol,
        time: dateWithZeroSeconds,
        open: item.Open,
        high: item.High,
        low: item.Low,
        close: item.Close,
        volume: item.Volume,
        value: item.Value,
      };
    }
    this.intradayData[item.Symbol] = oldData;

    // this.logger.log(`intraday import ${item.Symbol}`);
  }

  async updateDaily(data) {
    const formattedData = await data.map((item) => {
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
    await this.dailyOhlcModel.bulkCreate(formattedData, {
      ignoreDuplicates: true,
    });
    this.logger.log(`daily import`);
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
    this.logger.log(`update roc`);

    // Thực hiện các hành động bạn muốn ở đây
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateIntraday() {
    console.log('hih');

    const data = this.intradayData;
    this.intradayData = {};
    this.eventsGateway.sendOhlc();

    await this.intradayOhlcModel.bulkCreate(Object.values(data), {
      ignoreDuplicates: true,
    });

    const daily = this.dailyData;
    Object.values(data).forEach((newData: any) => {
      let oldData = daily[newData.symbol];
      if (oldData) {
        if (oldData.high < newData.high) {
          oldData.high = newData.high;
        }
        if (oldData.low > newData.low) {
          oldData.low = newData.low;
        }
        oldData.close = newData.close;
        oldData.volume = newData.volume;
        oldData.value = newData.value;
      } else {
        const formattedDate = format(newData.time, 'yyyy-MM-dd');
        oldData = {
          symbol: newData.symbol,
          time: formattedDate,
          open: newData.open,
          high: newData.high,
          low: newData.low,
          close: newData.close,
          volume: newData.volume,
          value: newData.value,
        };
      }
      this.dailyData[newData.symbol] = oldData;
    });

    this.dailyData = daily;
    await this.dailyOhlcModel.bulkCreate(Object.values(this.dailyData), {
      updateOnDuplicate: ['open', 'high', 'low', 'close', 'volume', 'value'],
    });

    // Thực hiện các hành động bạn muốn ở đây
  }
}
