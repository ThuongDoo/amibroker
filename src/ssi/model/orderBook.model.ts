import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class OrderBook extends Model {
  @Column
  symbol: string;

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
