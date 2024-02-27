import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class StockService {
  constructor(private readonly eventsGateway: EventsGateway) {}
  stockData = [];

  tempData = '';

  formatData(csvData) {
    const headers = csvData.split('\r\n')[0].split(',');

    // Tách các dòng còn lại thành mảng các đối tượng
    const dataArray = csvData.split('\r\n').slice(1);

    const result = dataArray.map((row) => {
      const values = row.split(',');
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj;
    });
    return result;
  }

  async getStock() {
    return this.stockData;
  }

  async getStockByName(stocks: string[]) {
    return this.stockData.filter((item) => stocks.includes(item.Ticker));
  }

  async sendData() {
    this.stockData = this.formatData(this.tempData);
    this.tempData = '';
    console.log(this.stockData.length);

    await this.eventsGateway.sendStockUpdateSignal();
  }

  async updateStock(data) {
    if (data.data == 'done') {
      this.sendData();
    } else {
      this.tempData += data.data;
    }
  }
}
