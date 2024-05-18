import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class Buysell extends Model {
  @Column
  ticker: string;

  @Column(DataType.DATEONLY)
  knTime: Date;

  @Column(DataType.DATEONLY)
  sellTime: Date;

  @Column(DataType.DATEONLY)
  sortTime: Date;

  @Column(DataType.FLOAT)
  buyPrice: number;

  @Column(DataType.FLOAT)
  sellPrice: number;

  @Column(DataType.FLOAT)
  profit: number;

  @Column
  holdingDuration: number;

  @Column
  risk: string;

  @Column
  status: number;
}
