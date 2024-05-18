import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service';
import { AuthenticatedGuard } from 'src/shared/guard/authenticated.guard';

@Controller('stock')
export class StockController {
  constructor(private stockService: StockService) {}

  @Post()
  updateStock(@Body() data) {
    return this.stockService.updateStock(data);
  }

  @Get()
  getAll() {
    return this.stockService.getStocks();
  }

  @Get('/san')
  getSan() {
    return this.stockService.getSan();
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/getStockByName/:stocks')
  getStocks(@Param('stocks') stocks: string) {
    const stocksArray = stocks.split(',');
    return this.stockService.getStockByName(stocksArray);
  }

  @Post('/filter')
  filter(@Body() filterParam: any) {
    return this.stockService.getFilter(filterParam);
  }
}
