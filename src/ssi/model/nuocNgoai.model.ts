import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table
export class NuocNgoai extends Model {
  @PrimaryKey
  @Column
  symbol: string;

  @PrimaryKey
  @Column(DataType.DATEONLY)
  time: Date;
}
