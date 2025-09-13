import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength
} from "class-validator";

export class PostIdDTO {
  @Min(1)
  @Type(() => Number)
  @IsInt()
  post_id!: number;
}

export class CreatePostCommentDTO extends PostIdDTO {
  @MinLength(1)
  @MaxLength(500)
  @IsString()
  content!: string;
}

export class CreatePostDTO {
  @MinLength(1)
  @MaxLength(200)
  @IsString()
  title!: string;

  @MinLength(1)
  @MaxLength(5000)
  @IsString()
  content!: string;

  @IsInt({ each: true })
  categories!: number[];
}

export class PostLikeDislikeDTO extends PostIdDTO {
  @IsOptional()
  dislike?: boolean;
}

export class PostCommentIdDTO {
  @Min(1)
  @IsInt()
  comment_id!: number;
}

/** Post creator only */
export class PostUpdateDTO extends PostIdDTO {
  @MinLength(1)
  @MaxLength(200)
  @IsString()
  @IsOptional()
  title!: string;

  @MinLength(1)
  @MaxLength(5000)
  @IsString()
  @IsOptional()
  content!: string;

  @IsInt({ each: true })
  @IsOptional()
  categories!: number[];
}
