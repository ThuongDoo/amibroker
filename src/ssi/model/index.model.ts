import {
  BelongsToMany,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Security } from './security.model';
import { IndexSecurity } from './indexSecurity.model';

@Table
export class Index extends Model {
  @PrimaryKey
  @Column({ field: 'indexCode' })
  IndexCode: string;

  @Column({ field: 'indexName' })
  IndexName: string;

  @Column({ field: 'exchange' })
  Exchange: string;

  @BelongsToMany(() => Security, () => IndexSecurity)
  Securities: Security[];
}
