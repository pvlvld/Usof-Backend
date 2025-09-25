import { IsInt, IsOptional, Length, Min, MinLength } from "class-validator";
import type { ICommentModel } from "./comment.model.js";
import { Type } from "class-transformer";

export class CommentIdParamDTO {
  @Min(1)
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  comment_id: number | null = null;

  @Min(1)
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  post_id: number | null = null;
}

export class CreateCommentBodyDTO
  implements Pick<ICommentModel, "parent_id" | "content">
{
  @Min(1)
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  parent_id: number | null = null;

  @Length(1, 5000)
  content!: string;
}

export class UpdateCommentDTO {
  @Length(1, 5000)
  content!: string;
}
