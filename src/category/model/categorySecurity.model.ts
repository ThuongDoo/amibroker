import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Security } from 'src/ssi/model/security.model';
import { Category } from './category.model';

@Table
export class CategorySecurity extends Model {
  @ForeignKey(() => Category)
  @Column
  categoryId: string;

  @ForeignKey(() => Security)
  @Column
  symbol: string;
}
