import { IsEmail, IsNumber, IsString } from 'class-validator';
import { UserRole } from 'src/enum/role.enum';

export class CreateUserDto {
  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  role: UserRole;

  @IsNumber()
  date: number;
}
