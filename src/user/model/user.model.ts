import {
  BelongsToMany,
  Column,
  DataType,
  IsEmail,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { Security } from 'src/ssi/model/security.model';
import { UserSecurity } from './userSecurity.model';

export enum UserRole {
  ADMIN = 'admin',
  STOCK1 = 'stock1',
}

@Table
export class User extends Model {
  @PrimaryKey
  @Column
  phone: string;

  @IsEmail
  @Unique
  @Column
  email: string;

  @Column
  password: string;

  @Column
  name: string;

  @Column({
    type: DataType.ENUM,
    values: Object.values(UserRole),
    defaultValue: [UserRole.STOCK1],
  })
  roles: UserRole[];

  @Column
  deviceInfo: string;

  @Column({
    allowNull: true,
    type: DataType.DATE,
  })
  expirationDate: Date;

  @BelongsToMany(() => Security, () => UserSecurity)
  Securities: Security[];
}
