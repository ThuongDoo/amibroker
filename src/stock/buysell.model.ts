import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class Buysell extends Model {
  @Column
  ticker: string;

  @Column(DataType.DATEONLY)
  date: Date;

  @Column(DataType.FLOAT)
  price: number;

  @Column(DataType.FLOAT)
  profit: number;

  @Column
  status: number;
}
