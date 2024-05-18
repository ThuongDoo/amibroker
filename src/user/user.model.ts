import {
  Column,
  DataType,
  IsEmail,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

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
}
