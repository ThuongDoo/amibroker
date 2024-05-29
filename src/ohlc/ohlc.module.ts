import { Module } from '@nestjs/common';
import { OhlcController } from './ohlc.controller';
import { OhlcService } from './ohlc.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DailyOhlc } from './dailyOhlc.model';
import { IntradayOhlc } from './intradayOhlc.model';
import { Roc } from './roc.model';

@Module({
  imports: [SequelizeModule.forFeature([DailyOhlc, IntradayOhlc, Roc])],
  controllers: [OhlcController],
  providers: [OhlcService],
  exports: [OhlcService],
})
export class OhlcModule {}
