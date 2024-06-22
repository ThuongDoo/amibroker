import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ArticleCategory } from './model/articleCategory.model';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(ArticleCategory)
    private articleCategoryModel: typeof ArticleCategory,
  ) {}

  async createCategory(name: string) {
    try {
      const article = await this.articleCategoryModel.create(
        { name: name },
        { ignoreDuplicates: true },
      );
      return { message: 'success' };
    } catch (e) {
      console.log(e);
    }
  }

  async getCategory() {
    const articles = await this.articleCategoryModel.findAll();
    return { data: articles };
  }

  async updateCategory(data: UpdateCategoryDto, id: string) {
    const category = await this.articleCategoryModel.findByPk(id);
    if (!category) {
      throw new NotFoundException(`Category with ${id} is not exist`);
    }
    await category.update(data);
    return category;
  }
}
