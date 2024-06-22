import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ArticleService } from './article.service';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('article')
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Post('/category')
  createCategory(@Body() data) {
    return this.articleService.createCategory(data.name);
  }

  @Get('/category')
  getCategory() {
    return this.articleService.getCategory();
  }

  @Post('/category/:id')
  updateCategory(@Body() data: UpdateCategoryDto, @Param('id') id: string) {
    return this.articleService.updateCategory(data, id);
  }
}
