import { IsString } from 'class-validator';

export class CategorySecurityDto {
  @IsString()
  categoryId: string;

  @IsString()
  symbol: string;
}
