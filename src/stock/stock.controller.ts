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

  @Post('/filter')
  filter(@Body() filterParam: any) {
    return this.stockService.getFilter(filterParam);
  }

  @Get('/chartData/import')
  async importChartData() {
    return await this.stockService.importChartData();
  }

  @Get('/chartData/importIntraday')
  async importIntradayChartData() {
    return await this.stockService.importIntradayChartData();
  }

  @Get('/chartData/importDaily')
  async importDailyChartData() {
    return await this.stockService.importDailyChartData();
  }

  @Get('/chartData')
  async getChartData(
    @Query('ticker') ticker: string,
    @Query('timeframe') timeframe: string,
  ) {
    console.log('ticker', ticker);

    return await this.stockService.getChartData(ticker, timeframe);
  }
}
