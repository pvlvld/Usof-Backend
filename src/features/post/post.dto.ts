import { Transform, Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
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

export class GetPostsDto {
  @Min(1)
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  page: number = 1;

  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  limit: number = 25;

  // Don't allow created_at sorting, map it to id to avoid creating additional indexes
  @Transform(({ value }) => (value === "created_at" ? "id" : value))
  @IsIn(["id", "login", "rating", "created_at", "updated_at"], {
    message:
      "sort must be one of the following values: id, login, rating, created_at, updated_at"
  })
  @Transform(({ value }) => ("" + value).toLowerCase())
  @IsString()
  @IsOptional()
  // Stupid default, but ok, it's a requirement
  sort: "id" | "login" | "rating" | "created_at" | "updated_at" = "rating";

  @IsIn(["ASC", "DESC"], {
    message: "order must be either 'ASC' or 'DESC'"
  })
  @Transform(({ value }) => ("" + value).toUpperCase())
  @IsString()
  @IsOptional()
  order: "ASC" | "DESC" = "ASC";

  @Transform(({ value }) => ("" + value).toLowerCase())
  @IsString()
  @IsOptional()
  categories: string = "all";

  @IsIn(["active", "inactive", "all"], {
    message: "status must be either 'active', 'inactive' or 'all'"
  })
  @Transform(({ value }) => ("" + value).toLowerCase())
  @IsString()
  @IsOptional()
  status: "active" | "inactive" | "all" = "all";

  @Min(0)
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  user: number = 0;

  @IsISO8601()
  @IsOptional()
  from_date?: string;

  @IsISO8601()
  @IsOptional()
  to_date?: string;
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
