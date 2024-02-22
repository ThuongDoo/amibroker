import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { CATEGORIES } from 'src/constants/categories';
import { GlobalService } from 'src/global/global.service';

@Injectable()
export class BoardService {
  constructor(public globalService: GlobalService) {}
  private bangdien;
  private buysell;
  private tempBuySell = [];

  getCurrentTime() {
    return moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  }

  formatData(data) {
    const lines = data.split('\r\n');
    const headers = lines[0].split(',');
    const result = [];
    for (let i = 1; i < lines.length - 1; i++) {
      const values = lines[i].split(',');
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = values[j];
      }
      result.push(obj);
    }
    return result;
  }
  classifyData(data) {
    const classifiedData = {};
    Object.keys(CATEGORIES).forEach((category) => {
      classifiedData[category] = [];
    });
    data.forEach((item) => {
      const ticker = item.Ticker;
      const matchedCategory = Object.keys(CATEGORIES).find((category) => {
        const tickers = CATEGORIES[category].split(',');
        return tickers.includes(ticker);
      });
      if (matchedCategory) {
        classifiedData[matchedCategory].push(item);
      }
    });
    return classifiedData;
  }
  async updateBangDien(data: any) {
    console.log(this.getCurrentTime(), 'update bang dien');
    const formattedData = this.formatData(data.data);
    this.bangdien = this.classifyData(formattedData);
  }

  async updateBuySell(data: any) {
    console.log(this.getCurrentTime(), 'update buy sell');
    this.tempBuySell.push(data.data);
    this.buysell = this.formatData(data.data);
    console.log(this.buysell);
  }

  async summarizeBuySell() {
    console.log(this.getCurrentTime(), 'summarize buy sell');
    if (this.tempBuySell.length !== 0) {
      const tempData = this.tempBuySell.join('');
      this.buysell = this.formatData(tempData);
      this.tempBuySell = [];
    }
  }

  getBuySell() {
    console.log(this.getCurrentTime(), 'get buy sell');
    console.log(this.buysell);

    return this.buysell;
  }

  getBoardData(categoryId: string) {
    console.log(this.getCurrentTime(), 'get board data');
    return this.bangdien[categoryId];
  }
}
