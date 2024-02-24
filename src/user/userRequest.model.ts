import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class UserRequest extends Model {
  @Column
  phone: string;

  @Column
  email: string;

  @Column
  name: string;

  @Column
  content: string;
}
