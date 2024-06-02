import { Module, forwardRef } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { StockModule } from 'src/stock/stock.module';
import { BuysellModule } from 'src/buysell/buysell.module';
import { SsiModule } from 'src/ssi/ssi.module';

@Module({
  imports: [
    forwardRef(() => StockModule),
    forwardRef(() => BuysellModule),
    SsiModule,
  ],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
