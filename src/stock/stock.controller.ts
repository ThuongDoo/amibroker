import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StockService } from './stock.service';
import { Public } from 'src/shared/decorator/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('stock')
export class StockController {
  constructor(private stockService: StockService) {}

  @Public()
  @Post()
  updateStock(@Body() data) {
    console.log('update');

    return this.stockService.updateStock(data);
  }

  @Public()
  @Get()
  getAll() {
    return this.stockService.getStocks();
  }

  @Public()
  @Get('/san')
  getSan() {
    return this.stockService.getSan();
  }

  @Public()
  @Get('/getStockByName/:stocks')
  getStocks(@Param('stocks') stocks: string) {
    const stocksArray = stocks.split(',');
    return this.stockService.getStockByName(stocksArray);
  }

  @Post('/filter')
  filter(@Body() filterParam: any) {
    return this.stockService.getFilter(filterParam);
  }

  @SkipThrottle()
  @Post('/roc')
  importRoc(@Body() data: any) {
    return this.stockService.importRoc(data);
  }

  // @Get('/roc/:categories')
  // getRoc(@Param('categories') categories: string) {
  //   const categoriesArray = categories.split(',');
  //   return this.stockService.getRoc(categoriesArray);
  // }

  @Get('/roc')
  getRoc() {
    return this.stockService.getRoc();
  }
}
