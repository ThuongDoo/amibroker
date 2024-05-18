import { IsEmail, IsNumber, IsString } from 'class-validator';
import { UserRole } from '../user.model';

export class CreateUserDto {
  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  roles: UserRole;

  @IsNumber()
  date: number;
}
