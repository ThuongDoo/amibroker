import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ArticleService } from './article.service';

@Controller('article')
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Post('/category')
  createCategory(@Body() name: string) {
    this.articleService.createCategory(name);
  }

  @Get('/category')
  getCategory(@Query('id') id: string) {
    this.articleService.getCategory(id);
  }
}
