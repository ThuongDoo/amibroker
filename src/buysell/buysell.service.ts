import { Injectable } from '@nestjs/common';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class BuysellService {
  constructor(private readonly eventsGateway: EventsGateway) {}
  buysellData = [];

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

  getBuySell() {
    return this.buysellData;
  }

  async updateBuysell(data) {
    this.buysellData = this.formatData(data.data);
    await this.eventsGateway.sendBuysellToAllClients(this.buysellData);
  }
}