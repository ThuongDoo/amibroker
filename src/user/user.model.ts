import {
  Column,
  DataType,
  IsEmail,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { UserRole } from 'src/enum/role.enum';

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
    defaultValue: UserRole.STOCK1,
  })
  role: UserRole;

  @Column
  deviceInfo: string;

  @Column({
    allowNull: true,
    type: DataType.DATE,
  })
  expirationDate: Date;
}
