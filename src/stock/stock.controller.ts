import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private stockService: StockService) {}

  @Post()
  updateStock(@Body() data) {
    return this.stockService.updateStock(data);
  }

  @Get('/getStockByName/:stocks')
  getStockByName(@Param('stocks') stocks: string) {
    const stocksArray = stocks.split(',');

    return this.stockService.getStockByName(stocksArray);
  }

  @Get('/getSan')
  getSan() {
    return this.stockService.getSan();
  }

  @Get('/getAll')
  getStocks() {
    return this.stockService.getStocks();
  }

  @Post('/buysell')
  updateBuysell(@Body() data) {
    return this.stockService.updateBuysell(data);
  }

  @Get('/buysell')
  getBuysell() {
    return this.stockService.getBuysell();
  }

  @Get('/filterBuysell')
  filterBuysell(
    @Query('date') dateFilter: string,
    @Query('ticker') ticker: string,
    @Query('limit') limit: string,
  ) {
    return this.stockService.filterBuysell(dateFilter, ticker, limit);
  }

  @Post('/buysell/importFile')
  importBuysell(@Body() data) {
    return this.stockService.importBuysell(data);
  }

  @Patch('/updateMuaMoi')
  updateMuaMoi() {
    return this.stockService.updateMuaMoi();
  }
}
