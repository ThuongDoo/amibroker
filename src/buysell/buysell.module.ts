import { Module } from '@nestjs/common';
import { BuysellService } from './buysell.service';
import { BuysellController } from './buysell.controller';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [EventsModule],
  providers: [BuysellService],
  controllers: [BuysellController],
})
export class BuysellModule {}
