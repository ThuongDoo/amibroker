import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Category } from './model/category.model';
import { CategorySecurity } from './model/categorySecurity.model';
import { Security } from 'src/ssi/model/security.model';
import { Roc } from 'src/ohlc/model/roc.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Category, CategorySecurity, Security, Roc]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
