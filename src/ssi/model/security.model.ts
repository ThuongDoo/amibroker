import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { IndexSecurity } from './indexSecurity.model';
import { Index } from './index.model';

@Table
export class Security extends Model {
  @Column({ field: 'isin' })
  Isin: string;

  @PrimaryKey
  @Column({ field: 'symbol' })
  Symbol: string;

  @Column({ field: 'symbolName' })
  SymbolName: string;

  @Column({ field: 'symbolEngName' })
  SymbolEngName: string;

  @Column({ field: 'secType' })
  SecType: string;

  @Column({ field: 'marketId' })
  MarketId: string;

  @Column({ field: 'exchange' })
  Exchange: string;

  @Column({ field: 'issuer' })
  Issuer: string;

  @Column({ field: 'lotSize' })
  LotSize: number;

  @Column({ field: 'issueDate' })
  IssueDate: string;

  @Column({ field: 'maturityDate' })
  MaturityDate: string;

  @Column({ field: 'firstTradingDate' })
  FirstTradingDate: string;

  @Column({ field: 'lastTradingDate' })
  LastTradingDate: string;

  @Column({ field: 'contractMultiplier' })
  ContractMultiplier: number;

  @Column({ field: 'settlMethod' })
  SettlMethod: string;

  @Column({ field: 'underlying' })
  Underlying: string;

  @Column({ field: 'putOrCall' })
  PutOrCall: string;

  @Column({ field: 'exercisePrice' })
  ExercisePrice: number;

  @Column({ field: 'exerciseStyle' })
  ExerciseStyle: string;

  @Column({ field: 'excerciseRatio' })
  ExcerciseRatio: string;

  @Column({ field: 'listedShare', type: DataType.BIGINT })
  ListedShare: bigint;

  @Column({ field: 'tickPrice1' })
  TickPrice1: number;

  @Column({ field: 'tickIncrement1' })
  TickIncrement1: number;

  @Column({ field: 'tickPrice2' })
  TickPrice2: number;

  @Column({ field: 'tickIncrement2' })
  TickIncrement2: number;

  @Column({ field: 'tickPrice3' })
  TickPrice3: number;

  @Column({ field: 'tickIncrement3' })
  TickIncrement3: number;

  @Column({ field: 'tickPrice4' })
  TickPrice4: number;

  @Column({ field: 'tickIncrement4' })
  TickIncrement4: number;

  @BelongsToMany(() => Index, () => IndexSecurity)
  Indexes: Index[];
}
