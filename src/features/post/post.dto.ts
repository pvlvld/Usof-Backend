import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength
} from "class-validator";
import { UserIdDTO } from "../user/user.dto.js";

export class PostIdDTO {
  @Min(1)
  @IsInt()
  post_id!: number;
}

export class CreatePostCommentDTO extends PostIdDTO {
  @MinLength(1)
  @MaxLength(500)
  @IsString()
  content!: string;
}

export class CreatePostDTO extends UserIdDTO {
  @MinLength(1)
  @MaxLength(200)
  @IsString()
  title!: string;

  @MinLength(1)
  @MaxLength(5000)
  @IsString()
  content!: string;

  @MinLength(1, { each: true })
  @MaxLength(20, { each: true })
  @IsString({ each: true })
  categories!: string[];
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
export class PostUpdateDTO extends CreatePostDTO {}
