import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class Buysell extends Model {
  @Column
  ticker: string;

  @Column
  date: Date;

  @Column
  price: number;

  @Column
  status: number;
}
