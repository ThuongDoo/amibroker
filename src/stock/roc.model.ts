import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table
export class Roc extends Model {
  @PrimaryKey
  @Column
  category: string;

  @PrimaryKey
  @Column(DataType.DATE)
  time: Date;

  @Column
  displayName: string;

  @Column(DataType.FLOAT)
  value: number;
}
