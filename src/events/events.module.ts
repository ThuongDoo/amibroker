import { Module, forwardRef } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { StockModule } from 'src/stock/stock.module';

@Module({
  imports: [forwardRef(() => StockModule)],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
