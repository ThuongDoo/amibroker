import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Security } from './security.model';
import { Index } from './index.model';

@Table
export class IndexSecurity extends Model {
  @ForeignKey(() => Index)
  @Column
  indexCode: string;

  @ForeignKey(() => Security)
  @Column
  symbol: string;
}
