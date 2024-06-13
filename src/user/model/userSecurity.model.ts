import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from './user.model';
import { Security } from 'src/ssi/model/security.model';

@Table
export class UserSecurity extends Model {
  @ForeignKey(() => User)
  @Column
  phone: string;

  @ForeignKey(() => Security)
  @Column
  symbol: string;
}
