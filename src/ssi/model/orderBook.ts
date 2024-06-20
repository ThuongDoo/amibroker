import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table
export class OrderBook extends Model {
  @PrimaryKey
  @Column
  symbol: string;

  @PrimaryKey
  @Column(DataType.TIME)
  time: string;

  @Column(DataType.FLOAT)
  lastPrice: number;

  @Column(DataType.FLOAT)
  lastVol: number;

  @Column
  tradingSession: string;

  @Column
  side: string;
}
