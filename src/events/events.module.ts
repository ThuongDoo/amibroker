import { Module, forwardRef } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { StockModule } from 'src/stock/stock.module';
import { BuysellModule } from 'src/buysell/buysell.module';

@Module({
  imports: [forwardRef(() => StockModule), forwardRef(() => BuysellModule)],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
