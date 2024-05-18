import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { EventsGateway } from 'src/events/events.gateway';
import { Utils } from 'src/shared/utils/utils';

@Injectable()
export class StockService {
  constructor(
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
  ) {}

  // stocksData = [];
  stocksData = [
    {
      Ticker: 'SSI',
      'Date/Time': '2024-05-10',
      Giahientai: '35.45',
      Volume: '12118500',
      GiatriGD: '429600833536',
      'Tang/Giam': '0.25',
      'Tang/Giam (%)': '0.71',
      PPSEPA: '0',
      RSRating: '38.71',
      "RS-O'neil": '39',
      RSI: '47.62',
      MACD: '-0.38',
      MACDcatlen: '0',
      MACDnamtren: '1',
      MACDcatxuong: '0',
      MACDnamduoi: '0',
      Sideway: '0',
      Trend: '1',
      ADX: '20.96',
      'DMI ': '15.88',
      'DMI-': '23.73',
      MFI: '35.54',
      MA10: '1',
      MA15: '1',
      MA20: '0',
      MA50: '0',
      MA100: '1',
      MA200: '1',
      ChamdaiduoiBB: '0',
      ChamdaitrenBB: '0',
      NoSupply: '1',
      GiaCaoNhat52W: '0',
      GiaThapHon52W: '0',
      Pivotspocket: '0',
      Shakeoutconfirmed: '0',
      EPS: '1.53',
      'P/E': '23.18',
      BookValuePerShare: '15.50',
      'P/B': '2.29',
      DTtrenCP: '4.77',
      'P/S': '7.42',
      OCF: '-12656317562880.00',
      'P/CF': '-0.00',
      'Dividend Yield (%)': '2.82',
      TyleCPluuhanh: '1499138688.00',
      'Free-Float': '360561824.00',
      Beta: '1.73',
      'Bienloinhuangop (%)': '32.06',
      'Bienloinhuanhoatdong %': '39.78',
      'ROA (%)': '3.78',
      'ROE (%)': '10.05',
      Tangtruongdoanhthutheoquy: '12.97',
      LNGtrenCP: '3.15',
      TangtruongLNhangquy: '120.06',
      San: 'HNX',
      'Phan loai Cp': 'Co phieu',
    },
    {
      Ticker: 'SSI',
      'Date/Time': '2024-05-10',
      Giahientai: '35.45',
      Volume: '12118500',
      GiatriGD: '429600833536',
      'Tang/Giam': '0.25',
      'Tang/Giam (%)': '0.71',
      PPSEPA: '0',
      RSRating: '38.71',
      "RS-O'neil": '39',
      RSI: '47.62',
      MACD: '-0.38',
      MACDcatlen: '0',
      MACDnamtren: '1',
      MACDcatxuong: '0',
      MACDnamduoi: '0',
      Sideway: '0',
      Trend: '1',
      ADX: '20.96',
      'DMI ': '15.88',
      'DMI-': '23.73',
      MFI: '35.54',
      MA10: '1',
      MA15: '1',
      MA20: '0',
      MA50: '0',
      MA100: '1',
      MA200: '1',
      ChamdaiduoiBB: '0',
      ChamdaitrenBB: '0',
      NoSupply: '1',
      GiaCaoNhat52W: '0',
      GiaThapHon52W: '0',
      Pivotspocket: '0',
      Shakeoutconfirmed: '0',
      EPS: '1.53',
      'P/E': '23.18',
      BookValuePerShare: '15.50',
      'P/B': '2.29',
      DTtrenCP: '4.77',
      'P/S': '7.42',
      OCF: '-12656317562880.00',
      'P/CF': '-0.00',
      'Dividend Yield (%)': '2.82',
      TyleCPluuhanh: '1499138688.00',
      'Free-Float': '360561824.00',
      Beta: '1.73',
      'Bienloinhuangop (%)': '32.06',
      'Bienloinhuanhoatdong %': '39.78',
      'ROA (%)': '3.78',
      'ROE (%)': '10.05',
      Tangtruongdoanhthutheoquy: '12.97',
      LNGtrenCP: '3.15',
      TangtruongLNhangquy: '120.06',
      San: 'HSX',
      'Phan loai Cp': 'Co phieu',
    },
  ];
  stockSan = [];
  tempData = [];

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
    console.log('data', data);

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

    console.log(filterData);
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
