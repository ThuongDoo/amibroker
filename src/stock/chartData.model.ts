import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table
export class ChartData extends Model {
  @PrimaryKey
  @Column
  ticker: string;

  @PrimaryKey
  @Column(DataType.DATEONLY)
  time: Date;

  @Column
  market: string;

  @Column(DataType.FLOAT)
  open: number;

  @Column(DataType.FLOAT)
  high: number;

  @Column(DataType.FLOAT)
  low: number;

  @Column(DataType.FLOAT)
  close: number;

  @Column(DataType.FLOAT)
  value: number;

  @Column(DataType.FLOAT)
  volume: number;
}
