import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BuysellService } from './buysell.service';

@Controller('buysell')
export class BuysellController {
  constructor(private buysellService: BuysellService) {}

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

  @Post('/import')
  importFile(@Body() data) {
    return this.buysellService.importBuysell(data);
  }
}
