import { Body, Controller, Post } from '@nestjs/common';
import { BuysellService } from './buysell.service';

@Controller('buysell')
export class BuysellController {
  constructor(private buysellService: BuysellService) {}

  @Post()
  updateBuySell(@Body() data) {
    return this.buysellService.updateBuysell(data);
  }
}
