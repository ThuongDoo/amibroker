import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoryService } from './category.service';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('/update')
  async updateCategory(@Body() data: UpdateCategoryDto) {
    return await this.categoryService.updateCategory(
      data.categories,
      data.securities,
    );
  }

  @Get()
  async getCategory() {
    return await this.categoryService.getCategory();
  }
}
