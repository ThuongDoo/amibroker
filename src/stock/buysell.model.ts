import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class Buysell extends Model {
  @Column
  ticker: string;

  @Column(DataType.DATEONLY)
  date: Date;

  @Column
  price: number;

  @Column
  status: number;
}
