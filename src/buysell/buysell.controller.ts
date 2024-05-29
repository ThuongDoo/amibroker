import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BuysellService } from './buysell.service';
import { Public } from 'src/shared/decorator/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('buysell')
export class BuysellController {
  constructor(private buysellService: BuysellService) {}

  @SkipThrottle()
  @Public()
  @Post()
  updateBuysell(@Body() data: any) {
    return this.buysellService.updateBuysell(data);
  }

  @Get()
  getBuysell(
    @Query('date') dateFilter: string,
    @Query('ticker') ticker: string,
    @Query('limit') limit: string,
  ) {
    return this.buysellService.filterBuysell(dateFilter, ticker, limit);
  }

  @SkipThrottle()
  @Post('/import')
  importFile(@Body() data) {
    return this.buysellService.importBuysell(data);
  }
}
