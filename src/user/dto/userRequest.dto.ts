import { IsEmail, IsString } from 'class-validator';

export class UserRequestDto {
  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  content: string;
}
