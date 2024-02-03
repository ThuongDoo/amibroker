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
    const close = data.close?.split(',');
    const volumn = data.volumn?.split(',');
    const date = data.date?.split(',');
    const filterData = [];
    for (const i in close) {
      filterData[i] = {
        close: close[i],
        volumn: volumn[i],
        date: date[i],
      };
    }

    // console.log(filterData);
    // console.log('hah');
    console.log(data.ticker);
  }
}
