import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { EventsGateway } from 'src/events/events.gateway';
import { SequelizeModule } from '@nestjs/sequelize';
import { Buysell } from './buysell.model';
import { StockBuySell } from './stockBuysell.model';

@Module({
  imports: [SequelizeModule.forFeature([Buysell, StockBuySell])],
  providers: [StockService, EventsGateway],
  controllers: [StockController],
  exports: [StockService],
})
export class StockModule {}
