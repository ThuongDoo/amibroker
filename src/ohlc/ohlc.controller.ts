import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OhlcService } from './ohlc.service';
import { SkipThrottle } from '@nestjs/throttler';
import { format, subDays } from 'date-fns';
import { Public } from 'src/shared/decorator/public.decorator';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { UserRole } from 'src/user/model/user.model';

@Controller('ohlc')
export class OhlcController {
  constructor(private readonly ohlcService: OhlcService) {}

  @Public()
  @Get('/daily')
  async getDailyOhlc(@Query('ticker') ticker: string) {
    return await this.ohlcService.getDaily(ticker);
  }

  @Roles(UserRole.ADMIN)
  @Get('/daily/update')
  updateDailyOhlc() {
    this.ohlcService.importDaily();
    return 'hah';
  }

  @Public()
  @Get('/intraday')
  async getIntradayOhlc(@Query('ticker') ticker: string) {
    return await this.ohlcService.getIntraday(ticker);
  }

  @Roles(UserRole.ADMIN)
  @Get('/intraday/update')
  updateIntradayOhlc() {
    const currentDate = new Date();
    const toDate = format(currentDate, 'dd/MM/yyyy');
    const fromDate = format(subDays(currentDate, 30), 'dd/MM/yyyy');
    this.ohlcService.importIntraday(fromDate, toDate);
    return 'hah';
  }

  @Get('/roc')
  async getRoc(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return await this.ohlcService.getRoc(startDate, endDate);
  }

  @Roles(UserRole.ADMIN)
  @Get('/roc/update')
  async updateRoc() {
    return await this.ohlcService.updateRoc();
  }
}
