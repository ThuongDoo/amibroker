import { Injectable } from '@nestjs/common';
import { endpoints } from 'src/shared/utils/api';
import { Utils } from 'src/shared/utils/utils';
import * as client from './ssi-fcdata';
import api from '../shared/utils/api';
import { InjectModel } from '@nestjs/sequelize';
import { Security } from './security.model';

@Injectable()
export class SsiService {
  private token;
  private fData: any = {};
  private xData: any = {};
  private quoteData: any = {};
  private tradeData: any = {};
  private bData: any = {};
  private rData: any = {};
  private miData: any = {};

  constructor(
    @InjectModel(Security)
    private securityModel: typeof Security,
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
        this.xData[data.Sybmol] = data;
        break;
      case 'X-QUOTE':
        this.quoteData[data.Sybmol] = data;
        break;
      case 'X-TRADE':
        this.tradeData[data.Symbol] = data;
        break;
      case 'B':
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
      return filteredIndex;
    }
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

    let length;
    do {
      const newData = await fetchData(pageIndex, pageSize, token);
      length = newData.TotalNoSym;
      try {
        const stocks = await this.securityModel.bulkCreate(
          newData.RepeatedInfo,
          {
            ignoreDuplicates: true,
          },
        );
        data.push(...stocks);
      } catch (error) {
        console.log(error);
      }
      console.log('load', pageIndex);
      pageIndex++;

      await this.sleep(1000);
      // code block to be executed
    } while ((pageIndex - 1) * pageSize < length);
    return { length: data.length, data };
    // return data;
  }

  async getSecurity() {
    const securities = await this.securityModel.findAll({});
    return { length: securities.length, data: securities };
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
