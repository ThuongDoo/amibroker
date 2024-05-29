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

  @SkipThrottle()
  @Post('/daily/import')
  importChartData(@Body() data) {
    return this.ohlcService.importDaily(data);
  }

  @Get('/intraday')
  async getIntradayOhlc(@Query('ticker') ticker: string) {
    return await this.ohlcService.getIntraday(ticker);
  }

  @SkipThrottle()
  @Post('/intraday/import')
  async importIntradayChartData(@Body() data) {
    return await this.ohlcService.importIntraday(data);
  }

  @Get('/roc/:timeRange')
  async getRoc(@Param('timeRange') timeRange: string) {
    console.log(timeRange);

    return await this.ohlcService.getRoc(timeRange);
  }
}
