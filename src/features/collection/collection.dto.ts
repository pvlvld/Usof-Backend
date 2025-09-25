import { Transform, Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength
} from "class-validator";

export class CollectionNameDTO {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  collection_name!: string;
}

export class PostIdDTO {
  @Min(1)
  @Type(() => Number)
  @IsInt()
  post_id!: number;
}

export class CreateCollectionDTO {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string;
}

export class UpdateCollectionDTO {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string;
}

export class AddPostToCollectionDTO extends PostIdDTO {}

export class RemovePostFromCollectionDTO extends PostIdDTO {}
