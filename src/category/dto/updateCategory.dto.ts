import { IsString } from 'class-validator';
import { CategoryDto } from './category.dto';
import { CategorySecurityDto } from './categorySecurity.dto';

export class UpdateCategoryDto {
  categories: CategoryDto[];

  @IsString()
  securities: CategorySecurityDto[];
}
