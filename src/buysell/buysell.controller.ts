import { Body, Controller, Get, Post } from '@nestjs/common';
import { BuysellService } from './buysell.service';

@Controller('buysell')
export class BuysellController {
  constructor(private buysellService: BuysellService) {}

  @Post()
  updateBuySell(@Body() data) {
    return this.buysellService.updateBuysell(data);
  }

  @Get()
  getBuySell() {
    return this.buysellService.getBuySell();
  }
}
