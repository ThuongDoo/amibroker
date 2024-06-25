import { Controller, Get, Query } from '@nestjs/common';
import { TradingViewService } from './trading-view.service';
import { Public } from 'src/shared/decorator/public.decorator';

@Controller('trading-view')
export class TradingViewController {
  constructor(private readonly tradingViewService: TradingViewService) {}

  @Public()
  @Get('/time')
  getTime() {
    const time = Math.floor(Date.now() / 1000); // In seconds
    return time.toString();
  }

  @Get('/config')
  async getConfig() {
    return await this.tradingViewService.getConfig();
  }

  @Get('/symbol_info')
  async getSymbolInfo() {
    return await this.tradingViewService.getSymbolInfo();
  }

  @Get('/symbols')
  async getSymbols(@Query('symbol') symbol: string) {
    return await this.tradingViewService.getSymbols(symbol);
  }

  @Get('/search')
  async getSearch(@Query('query') searchQuery) {
    return await this.tradingViewService.getSearch(searchQuery);
  }

  @Get('/history')
  async getHistory(
    @Query('symbol') symbol: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('resolution') resolution: string,
  ) {
    return await this.tradingViewService.getHistory(
      symbol,
      from,
      to,
      resolution,
    );
  }
}
