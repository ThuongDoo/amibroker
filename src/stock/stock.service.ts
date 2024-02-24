import { Injectable } from '@nestjs/common';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class StockService {
  constructor(private readonly eventsGateway: EventsGateway) {}
  stockData = [];

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

  async updateStock(data) {
    this.stockData = this.formatData(data.data);
  }
}
