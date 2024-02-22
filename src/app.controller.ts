import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import * as moment from 'moment';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    console.log(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));

    return this.appService.getHello();
  }

  @Post()
  getData(@Body() data) {
    const currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    console.log(currentTime);
    const newData = data.data;
    const lines = newData.split('\r\n');
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

    console.log(result);
  }
}
