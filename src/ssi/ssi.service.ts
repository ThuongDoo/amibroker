import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { endpoints } from 'src/shared/utils/api';
import * as client from './ssi-fcdata';
import api from '../shared/utils/api';
import { InjectModel } from '@nestjs/sequelize';
import { Security } from './model/security.model';
import { IndexSecurity } from './model/indexSecurity.model';
import { Index } from './model/index.model';
import { Op } from 'sequelize';
import { Utils } from 'src/shared/utils/utils';
import { OhlcService } from 'src/ohlc/ohlc.service';
import { OrderBook } from './model/orderBook.model';
import { Cron } from '@nestjs/schedule';
import { format, parse, subDays } from 'date-fns';
import { NuocNgoai } from './model/nuocNgoai.model';

@Injectable()
export class SsiService {
  private token;
  private fData: any = {};
  private xData: any = {};
  private quoteData: any = {};
  private tradeData: any = {};
  private bData: any = {};
  private rData: any = {};
  private miData: any = {
    HNXIndex: {
      IndexId: 'HNXIndex',
      IndexValue: 245.02,
      PriorIndexValue: 1283.8,
      TradingDate: '12/07/2024',
      Time: '15:02:05',
      TotalTrade: 352721,
      TotalQtty: 546826154,
      TotalValue: 13766118300540,
      IndexName: 'HNXIndex',
      Advances: 62,
      NoChanges: 64,
      Declines: 97,
      Ceilings: 3,
      Floors: 9,
      Change: -0.37,
      RatioChange: -0.15,
      TotalQttyPt: 59481983,
      TotalValuePt: 1487309699460,
      Exchange: 'HOSE',
      AllQty: 606308137,
      AllValue: 1128287000000,
      IndexType: 'Main',
      TradingSession: 'C',
      MarketId: null,
      RType: 'MI',
      TotalQttyOd: 0,
      TotalValueOd: 0,
    },
    HNX30: {
      IndexId: 'HNX30',
      IndexValue: 541.26,
      PriorIndexValue: 1283.8,
      TradingDate: '12/07/2024',
      Time: '15:02:05',
      TotalTrade: 352721,
      TotalQtty: 546826154,
      TotalValue: 13766118300540,
      IndexName: 'HNX30',
      Advances: 10,
      NoChanges: 7,
      Declines: 13,
      Ceilings: 0,
      Floors: 0,
      Change: -1.67,
      RatioChange: -0.31,
      TotalQttyPt: 59481983,
      TotalValuePt: 1487309699460,
      Exchange: 'HOSE',
      AllQty: 606308137,
      AllValue: 766195000000,
      IndexType: 'Main',
      TradingSession: 'C',
      MarketId: null,
      RType: 'MI',
      TotalQttyOd: 0,
      TotalValueOd: 0,
    },
    HNXUpcomIndex: {
      IndexId: 'HNXUpcomIndex',
      IndexValue: 98.14,
      PriorIndexValue: 1283.8,
      TradingDate: '12/07/2024',
      Time: '15:02:05',
      TotalTrade: 352721,
      TotalQtty: 546826154,
      TotalValue: 13766118300540,
      IndexName: 'HNXUpcomIndex',
      Advances: 162,
      NoChanges: 116,
      Declines: 161,
      Ceilings: 38,
      Floors: 17,
      Change: -0.18,
      RatioChange: -0.18,
      TotalQttyPt: 59481983,
      TotalValuePt: 1487309699460,
      Exchange: 'HOSE',
      AllQty: 606308137,
      AllValue: 961831000000,
      IndexType: 'Main',
      TradingSession: 'C',
      MarketId: null,
      RType: 'MI',
      TotalQttyOd: 0,
      TotalValueOd: 0,
    },
  };
  private logger: Logger = new Logger('SsiService');

  constructor(
    @Inject(forwardRef(() => OhlcService))
    private readonly ohlcService: OhlcService,
    @InjectModel(Security)
    private securityModel: typeof Security,
    @InjectModel(IndexSecurity)
    private indexSecurityModel: typeof IndexSecurity,
    @InjectModel(Index)
    private indexModel: typeof Index,
    @InjectModel(OrderBook)
    private orderBookModel: typeof OrderBook,
    @InjectModel(NuocNgoai)
    private nuocNgoaiModel: typeof NuocNgoai,
  ) {}

  async onModuleInit() {
    const formatData = (message) => {
      const data = JSON.parse(message.toString());
      const content = JSON.parse(data.Content);
      this.updateData(content);
    };
    // Địa chỉ URL của socket server
    this.token = await this.getSSIToken(); // Đảm bảo rằng getToken là một phương thức async

    client.initStream({
      url: process.env.SSIHubUrl,
      token: this.token,
    });
    client.bind(client.events.onData, function (message) {
      // const nm = message.toString();

      formatData(message);
    });
    client.bind(client.events.onConnected, function () {
      client.switchChannel(
        'MI:ALL,F:ALL,X:ALL,X-QUOTE:ALL,X-TRADE:ALL,B:ALL,R:ALL',
        // 'R:ALL',
      );
    });
    client.start();
  }

  async getSSIToken() {
    let token;

    await api
      .post(endpoints.GET_ACCESS_TOKEN, {
        consumerID: process.env.SSIConsumerId,
        consumerSecret: process.env.SSIConsumerSecret,
      })
      .then((res) => {
        token = 'Bearer ' + res.data.data.accessToken;
      })
      .catch((e) => {
        console.log('e');

        throw e;
      });

    return token;
  }

  getToken() {
    return this.token;
  }

  updateData(data) {
    const dataType = data.RType;

    switch (dataType) {
      case 'F':
        this.fData[data.Symbol] = data;
        break;
      case 'X':
        this.xData[data.Symbol] = data;
        break;
      case 'X-QUOTE':
        this.quoteData[data.Sybmol] = data;
        break;
      case 'X-TRADE':
        this.updateOrderBook(data);
        this.tradeData[data.Symbol] = data;
        break;
      case 'B':
        this.ohlcService.updateOneIntraday(data);
        this.bData[data.Symbol] = data;
        break;
      case 'R':
        this.rData[data.Symbol] = data;
        break;
      case 'MI':
        this.miData[data.IndexId] = data;
        break;
    }
  }

  updateOrderBook(data) {
    this.orderBookModel.create(
      {
        symbol: data.Symbol,
        time: data.Time,
        lastPrice: data.LastPrice,
        lastVol: data.LastVol,
        tradingSession: data.TradingSession,
        side: data.Side,
      },
      { ignoreDuplicates: true },
    );
  }

  async getOrderBook(symbol) {
    const orderBook = await this.orderBookModel.findAll({ where: { symbol } });
    return JSON.stringify(orderBook);
  }

  getFData() {
    return this.fData;
  }

  getMiData(indexes: string) {
    if (indexes === undefined) {
      return this.miData;
    } else {
      const indexArray = indexes.split(',');

      const filteredIndex = indexArray.reduce((result, key) => {
        if (this.miData.hasOwnProperty(key)) {
          result.push(this.miData[key]);
        }
        return result;
      }, []);

      return JSON.stringify(filteredIndex);
    }
  }

  async getTradeData(securites: string) {
    if (securites === null) {
      const data = await Object.values(this.tradeData);
      return JSON.stringify(data);
    } else {
      const securityArray = securites.split(',');
      const filteredSecurity = await securityArray.reduce((result, key) => {
        if (this.tradeData.hasOwnProperty(key)) {
          result.push(this.tradeData[key]);
        }
        return result;
      }, []);
      return JSON.stringify(filteredSecurity);
    }
  }

  async getXData(security: string) {
    return JSON.stringify(this.xData[security]);
  }

  async getRData(security: string) {
    return JSON.stringify(this.rData[security]);
  }

  async importSecurity() {
    const fetchData = async (pageIndex, pageSize, token) => {
      let data;
      const lookupRequest = {
        market: '',
        symbol: '',
        pageIndex: pageIndex,
        pageSize: pageSize,
        headers: token,
      };

      await api
        .get(
          endpoints.SECURITIES_DETAIL +
            '?lookupRequest.market=' +
            lookupRequest.market +
            '&lookupRequest.pageIndex=' +
            lookupRequest.pageIndex +
            '&lookupRequest.pageSize=' +
            lookupRequest.pageSize +
            '&lookupRequest.symbol=' +
            lookupRequest.symbol,
          { headers },
        )
        .then((res) => {
          data = res.data.data;
        })
        .catch((error) => {
          console.log(error);
        });
      return data[0];
    };
    const token = this.getToken();

    const headers = {
      Authorization: token, // Thêm header Authorization
    };

    const data = [];
    const pageSize = 1000;
    let pageIndex = 1;
    const fields = Object.keys(this.securityModel.getAttributes()).filter(
      (key) =>
        !this.securityModel.getAttributes()[key].primaryKey &&
        !this.securityModel.getAttributes()[key].unique,
    );

    let length;
    do {
      const newData = await fetchData(pageIndex, pageSize, token);
      length = newData.TotalNoSym;

      try {
        const stocks = await this.securityModel.bulkCreate(
          newData.RepeatedInfo,
          {
            updateOnDuplicate: fields,
          },
        );
        data.push(...stocks);
      } catch (error) {
        console.log(error);
      }
      pageIndex++;

      await Utils.sleep(1000);
      // code block to be executed
    } while ((pageIndex - 1) * pageSize < length);
    return { length: data.length, data };
    // return data;
  }

  async importVnindex() {
    const fetchData = async (pageIndex, pageSize, token) => {
      let data;
      const lookupRequest = {
        market: 'HOSE',
        pageIndex: pageIndex,
        pageSize: pageSize,
        headers: token,
      };

      await api
        .get(
          endpoints.SECURITIES_LIST +
            '?lookupRequest.market=' +
            lookupRequest.market +
            '&lookupRequest.pageIndex=' +
            lookupRequest.pageIndex +
            '&lookupRequest.pageSize=' +
            lookupRequest.pageSize,
          { headers },
        )
        .then((res) => {
          data = res.data;
        })
        .catch((error) => {
          console.log(error);
        });
      return data;
    };
    const token = this.getToken();

    const headers = {
      Authorization: token, // Thêm header Authorization
    };

    const pageSize = 1000;
    const pageIndex = 1;

    const response = await fetchData(pageIndex, pageSize, token);

    try {
      await this.indexModel.create({
        IndexCode: 'VNINDEX',
        IndexName: 'VNINDEX',
        Exchange: 'HOSE',
      });
    } catch (error) {
      console.log(error);
    }
    const indexSecurities = response.data.map((item) => {
      return {
        indexCode: 'VNINDEX',
        symbol: item.Symbol,
      };
    });

    try {
      const a = await this.indexSecurityModel.bulkCreate(indexSecurities, {
        ignoreDuplicates: true,
      });
      return { length: a.length, a };
    } catch (error) {
      console.log(error);
    }

    // return data;
  }

  async importIndexComponent() {
    const fetchData = async (pageIndex, pageSize, token) => {
      let data;
      const lookupRequest = {
        indexCode: '',
        pageIndex: pageIndex,
        pageSize: pageSize,
        headers: token,
      };

      await api
        .get(
          endpoints.INDEX_COMPONENT +
            '?lookupRequest.indexCode=' +
            lookupRequest.indexCode +
            '&lookupRequest.pageIndex=' +
            lookupRequest.pageIndex +
            '&lookupRequest.pageSize=' +
            lookupRequest.pageSize,
          { headers },
        )
        .then((res) => {
          data = res.data;
        })
        .catch((error) => {
          console.log(error);
        });
      return data;
    };
    const token = this.getToken();

    const headers = {
      Authorization: token, // Thêm header Authorization
    };

    const inputData = [];
    const pageSize = 1000;
    let pageIndex = 1;
    const fields = Object.keys(this.indexModel.getAttributes()).filter(
      (key) =>
        !this.indexModel.getAttributes()[key].primaryKey &&
        !this.indexModel.getAttributes()[key].unique,
    );

    let length;
    do {
      const response = await fetchData(pageIndex, pageSize, token);

      length = response.totalRecord;
      inputData.push(...response.data);

      pageIndex++;

      await Utils.sleep(1000);
      // code block to be executed
    } while ((pageIndex - 1) * pageSize < length);

    try {
      await this.indexModel.bulkCreate(inputData, {
        updateOnDuplicate: fields,
      });
    } catch (error) {
      console.log(error);
    }
    const indexSecurities = inputData.map((item) => {
      const securities = item.IndexComponent.map((securityItem) => {
        return {
          indexCode: item.IndexCode,
          symbol: securityItem.StockSymbol,
        };
      });
      return securities;
    });

    const result = indexSecurities.flat();

    await this.indexSecurityModel.truncate();
    this.logger.log('index security truncate');

    try {
      await this.indexSecurityModel.bulkCreate(result);
    } catch (error) {
      console.log(error);
    }

    return { length: result.length, result };
    // return data;
  }

  async getSecurity(indexes: string) {
    if (indexes === undefined) {
      const results = await this.securityModel.findAll({
        attributes: ['Symbol'],
      });
      return { length: results.length, data: results };
    } else {
      const indexArray = indexes.split(',');

      if (indexArray.length === 1) {
        const results = await this.securityModel.findOne({
          where: { Symbol: indexes },
        });
        return { data: results };
      }
      const results = await this.indexSecurityModel.findAll({
        where: { indexCode: { [Op.in]: indexArray } }, // Sử dụng Op.in để tạo điều kiện OR
      });

      const groupedResults = new Map<string, any[]>();

      // Nhóm dữ liệu theo indexCode
      results.forEach((result) => {
        const indexCode = result.indexCode;
        if (!groupedResults.has(indexCode)) {
          groupedResults.set(indexCode, []);
        }
        groupedResults.get(indexCode).push(result.symbol);
      });

      // Chuyển đổi Map thành mảng các đối tượng
      const groupedArray = Array.from(groupedResults, ([indexCode, data]) => ({
        indexCode,
        data,
      }));
      return { length: groupedArray.length, data: groupedArray };
    }
  }

  async changeAll() {
    const currentDate = new Date();
    const toDate = format(currentDate, 'dd/MM/yyyy');
    const fromDate = format(subDays(currentDate, 30), 'dd/MM/yyyy');
    // await this.importSecurity();
    // await this.importIndexComponent();
    await this.importVnindex();
    await this.ohlcService.importDaily();
    await this.ohlcService.importIntraday(fromDate, toDate);
    await this.ohlcService.updateRoc();
  }

  @Cron('0 9 * * *')
  updateDailyOhlc() {
    this.logger.log(`update daily ohlc`);
    this.ohlcService.updateDaily(Object.values(this.bData));
    const newNuocNgoai = Object.values(this.rData).map((item: any) => {
      return {
        symbol: item.Symbol,
        time: parse(item.TradingDate, 'dd/MM/yyyy', new Date()),
      };
    });

    this.nuocNgoaiModel.bulkCreate(newNuocNgoai, { ignoreDuplicates: true });
  }

  @Cron('0 1 * * *')
  deleteDailyOrderBook() {
    this.logger.log(`truncate orderbook`);
    this.orderBookModel.truncate();
  }
}
