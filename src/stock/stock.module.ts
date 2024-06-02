import { Module, forwardRef } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { EventsModule } from 'src/events/events.module';
import { AuthModule } from 'src/auth/auth.module';
import { OhlcModule } from 'src/ohlc/ohlc.module';
import { SsiModule } from 'src/ssi/ssi.module';

@Module({
  imports: [forwardRef(() => EventsModule), AuthModule, OhlcModule, SsiModule],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
