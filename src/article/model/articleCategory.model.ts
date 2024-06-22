import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class ArticleCategory extends Model {
  @Column
  name: string;
}
