import { IsInt, IsOptional, Length, Min, MinLength } from "class-validator";
import type { ICommentModel } from "./comment.model.js";
import { Type } from "class-transformer";

export class CommentIdDTO {
  @Min(1)
  @Type(() => Number)
  @IsInt()
  comment_id!: number;
}

export class CreateCommentDTO
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
