import { Module } from '@nestjs/common';
import { BuysellService } from './buysell.service';
import { BuysellController } from './buysell.controller';

@Module({
  providers: [BuysellService],
  controllers: [BuysellController]
})
export class BuysellModule {}
