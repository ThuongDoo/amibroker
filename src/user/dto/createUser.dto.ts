import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../model/user.model';

export class CreateUserDto {
  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsNumber()
  date?: number;
}
