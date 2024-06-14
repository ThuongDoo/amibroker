import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OhlcService } from './ohlc.service';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('ohlc')
export class OhlcController {
  constructor(private readonly ohlcService: OhlcService) {}

  @Get('/daily')
  async getDailyOhlc(@Query('ticker') ticker: string) {
    return await this.ohlcService.getDaily(ticker);
  }

  @Get('/daily/update')
  updateDailyOhlc() {
    this.ohlcService.updateDaily();
    return 'hah';
  }

  @Get('/intraday')
  async getIntradayOhlc(@Query('ticker') ticker: string) {
    return await this.ohlcService.getIntraday(ticker);
  }

  @Get('/roc')
  async getRoc(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return await this.ohlcService.getRoc(startDate, endDate);
  }
}
