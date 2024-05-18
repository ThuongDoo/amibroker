import { Body, Controller, Get, Post } from '@nestjs/common';
import { OhlcService } from './ohlc.service';

@Controller('ohlc')
export class OhlcController {
  constructor(private readonly ohlcService: OhlcService) {}

  @Post('/daily')
  async importDaily(@Body() data) {
    return this.ohlcService.importDaily(data);
  }

  @Post('/intraday')
  async importIntraday(@Body() data) {
    return this.ohlcService.importIntraday(data);
  }

  @Get('/daily')
  async getDaily() {}

  @Get('/intraday')
  async getIntraday() {}
}
