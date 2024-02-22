import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BoardService } from './board.service';

@Controller('board')
export class BoardController {
  constructor(private boardService: BoardService) {}
  @Post()
  getDataFromAmibroker(@Body() data) {
    return this.boardService.updateBangDien(data);
  }

  @Post('/buysell')
  getBuySellFromAmibroker(@Body() data) {
    return this.boardService.updateBuySell(data);
  }

  @Post('/summarize-buysell')
  summarizeBuySell() {
    return this.boardService.summarizeBuySell();
  }

  @Get('bangdien/:categoryId')
  getBoardData(@Param('categoryId') categoryId: string) {
    return this.boardService.getBoardData(categoryId);
  }

  @Get('/buysell')
  getBuySell() {
    return this.boardService.getBuySell();
  }
}
