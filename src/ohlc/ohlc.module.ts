import { Module } from '@nestjs/common';
import { OhlcController } from './ohlc.controller';
import { OhlcService } from './ohlc.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DailyOhlc } from './dailyOhlc.model';
import { IntradayOhlc } from './intradayOhlc.model';

@Module({
  imports: [SequelizeModule.forFeature([DailyOhlc, IntradayOhlc])],
  controllers: [OhlcController],
  providers: [OhlcService],
})
export class OhlcModule {}
