import { Module, forwardRef } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { EventsModule } from 'src/events/events.module';
import { AuthModule } from 'src/auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Roc } from './roc.model';

@Module({
  imports: [
    forwardRef(() => EventsModule),
    AuthModule,
    SequelizeModule.forFeature([Roc]),
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
