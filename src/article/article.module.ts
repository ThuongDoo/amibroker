import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ArticleCategory } from './model/articleCategory';

@Module({
  imports: [SequelizeModule.forFeature([ArticleCategory])],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
