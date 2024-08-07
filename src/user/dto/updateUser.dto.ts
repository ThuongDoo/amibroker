import { IsEmail, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string;

  @IsString()
  date: string;
}
