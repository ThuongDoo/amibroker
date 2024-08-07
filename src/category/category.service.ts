import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './model/category.model';
import { CategorySecurity } from './model/categorySecurity.model';
import { Security } from 'src/ssi/model/security.model';
import { Roc } from 'src/ohlc/model/roc.model';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  constructor(
    @InjectModel(Category)
    private categoryModel: typeof Category,
    @InjectModel(CategorySecurity)
    private categorySecurityModel: typeof CategorySecurity,
    @InjectModel(Security)
    private securityModel: typeof Security,
    @InjectModel(Roc)
    private rocModel: typeof Roc,
  ) {}

  async updateCategory(categories, securities) {
    await this.categorySecurityModel.truncate();
    await this.categoryModel.destroy({ where: {}, truncate: false });
    await this.rocModel.truncate();
    try {
      await this.categoryModel.bulkCreate(categories, {
        updateOnDuplicate: ['name'],
      });
    } catch (error) {
      this.logger.error('Validation error', error.errors);
    }

    try {
      await this.categorySecurityModel.bulkCreate(securities, {
        ignoreDuplicates: true,
      });
    } catch (error) {
      this.logger.error('Validation error', error.errors);
    }
    return { message: 'success' };
  }

  async getCategory() {
    const categories = await this.categoryModel.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          model: this.securityModel, // Assuming 'securitiesModel' exists
          as: 'Securities', // Optional alias for clarity (optional)
          attributes: ['Symbol'], // Include only the 'Symbol' attribute
        },
      ],
    });
    return categories;
  }
}
