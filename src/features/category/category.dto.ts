import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength
} from "class-validator";

export class CategoryIdDto {
  @Min(1)
  @Type(() => Number)
  @IsInt()
  category_id!: number;
}

export class CreateCategoryDto {
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  name!: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateCategoryDto {
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  @IsOptional()
  name?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  description?: string;
}

export class GetCategoriesDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Max(100)
  @Min(1)
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  limit?: number = 100;
}

export class GetCategoryDto extends CategoryIdDto {}

export class DeleteCategoryDto extends CategoryIdDto {}
