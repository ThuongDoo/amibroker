import {
  BelongsToMany,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Security } from 'src/ssi/model/security.model';
import { CategorySecurity } from './categorySecurity.model';

@Table
export class Category extends Model {
  @PrimaryKey
  @Column
  id: string;

  @Column
  name: string;

  @BelongsToMany(() => Security, () => CategorySecurity)
  Securities: Security[];
}
