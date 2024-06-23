import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { EventsGateway } from 'src/events/events.gateway';
import { Utils } from 'src/shared/utils/utils';
import { OhlcService } from 'src/ohlc/ohlc.service';

@Injectable()
export class StockService {
  constructor(
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
    private ohlcService: OhlcService,
  ) {}

  stocksData = [];
  stockSan = [];
  tempData = [];
  roc = [];

  async formatSan() {
    const sanArray = ['VNINDEX', 'VN30', 'HNXINDEX', 'HNX30', 'UPINDEX'];
    const sortArray = ['VNINDEX', 'VN30', 'HNX', 'HNX30', 'UPCOM'];

    const tempData = this.stocksData;
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

  async getStocks() {
    const data = this.stocksData.map((item) => item.Ticker);

    return data;
  }

  async getStockByName(stocks: string[]) {
    return this.stocksData.filter((item) => stocks.includes(item.Ticker));
  }

  async sendUpdateSignalToClient() {
    this.stocksData = await Utils.formatData(this.tempData);

    this.tempData = [];
    this.stockSan = await this.formatSan();

    await this.eventsGateway.sendStockUpdateSignal();
  }

  async updateStock(data) {
    if (data.data == 'done') {
      this.sendUpdateSignalToClient();
    } else {
      this.tempData += data.data;
    }
  }

  getFilter(filterParam) {
    const trend = { isChecked: true, name: 'Trend', value: 2 };
    const uptrend = filterParam.Uptrend;
    const downtrend = filterParam.Downtrend;
    if (uptrend.isChecked && downtrend.isChecked) {
      trend.value = 2;
    } else if (uptrend.isChecked) {
      trend.value = 1;
    } else if (downtrend.isChecked) {
      trend.value = 0;
    } else {
      trend.isChecked = false;
    }

    delete filterParam.Downtrend;
    delete filterParam.Uptrend;
    filterParam.Trend = trend;

    const filterDate: any[] = Object.values(filterParam);

    const filterData = filterDate.filter((item) => {
      if (item.isChecked === false) {
        return false;
      }
      if (item.condition === 'range') {
        if (
          item.value1 === '' ||
          item.value2 === '' ||
          item.value1 === undefined ||
          !item.value2 === undefined
        ) {
          return false;
        }
      } else if (item.value === '' || item.value === undefined) {
        return false;
      }
      return true;
    });
    const checkCondition = (objA, objB) => {
      if (objA.Ticker.length > 3) return false;
      for (const item of objB) {
        if (item.condition) {
          if (item.condition === 'range') {
            // item.value1 <= obja <=item.value2
            if (
              item.value1 > Number(objA[item.name]) ||
              item.value2 < Number(objA[item.name])
            ) {
              return false;
            }
          } else if (item.condition === '<=') {
            if (Number(objA[item.name]) > item.value) {
              return false;
            }
          } else if (item.condition === '>=') {
            if (Number(objA[item.name]) < item.value) {
              return false;
            }
          } else if (item.condition === '=') {
            if (item.value != Number(objA[item.name])) {
              return false;
            }
          }
        } else if (item.option == 1) {
          if (!item.value.includes(objA[item.name])) {
            return false;
          }
        } else if (item.value != objA[item.name]) {
          return false;
        }
      }
      return true;
    };

    const result = this.stocksData;

    const a = result.filter((item) => checkCondition(item, filterData));
    const newResult = a.map((item) => {
      return {
        Ticker: item.Ticker,
        San: item.San,
        Giahientai: item.Giahientai,
        'Tang/Giam': item['Tang/Giam'],
        'Tang/Giam (%)': item['Tang/Giam (%)'],
        Volume: item.Volume,
        RSRating: item.RSRating,
        "RS-O'neil": item["RS-O'neil"],
        RSI: item.RSI,
        ADX: item.ADX,
        'DMI ': item['DMI '],
        'DMI-': item['DMI-'],
      };
    });
    return newResult;
  }
}
