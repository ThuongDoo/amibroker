import { Module, forwardRef } from '@nestjs/common';
import { OhlcController } from './ohlc.controller';
import { OhlcService } from './ohlc.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DailyOhlc } from './model/dailyOhlc.model';
import { IntradayOhlc } from './model/intradayOhlc.model';
import { Roc } from './model/roc.model';
import { SsiModule } from 'src/ssi/ssi.module';
import { Security } from 'src/ssi/model/security.model';
import { Category } from 'src/category/model/category.model';
import { Index } from 'src/ssi/model/index.model';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      DailyOhlc,
      IntradayOhlc,
      Roc,
      Security,
      Category,
      Index,
    ]),
    forwardRef(() => SsiModule),
    forwardRef(() => EventsModule),
  ],
  controllers: [OhlcController],
  providers: [OhlcService],
  exports: [OhlcService],
})
export class OhlcModule {}
