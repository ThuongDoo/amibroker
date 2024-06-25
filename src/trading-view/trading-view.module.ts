import { Module } from '@nestjs/common';
import { TradingViewController } from './trading-view.controller';
import { TradingViewService } from './trading-view.service';

@Module({
  controllers: [TradingViewController],
  providers: [TradingViewService]
})
export class TradingViewModule {}
