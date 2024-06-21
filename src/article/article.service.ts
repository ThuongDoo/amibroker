import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ArticleCategory } from './model/articleCategory';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(ArticleCategory)
    private articleCategoryModel: typeof ArticleCategory,
  ) {}

  createCategory(name: string) {}

  getCategory(ids: string) {}
}
