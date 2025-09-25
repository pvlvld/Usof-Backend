import type { NextFunction, Request, Response } from "express";
import { CommentModel } from "./comment.model.js";
import { CommentService } from "./comment.service.js";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  CommentIdParamDTO,
  CreateCommentBodyDTO,
  UpdateCommentDTO
} from "./comment.dto.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError
} from "../../shared/consts/errors.js";

class CommentController {
  private commentService: CommentService;
  constructor() {
    this.commentService = CommentService.getInstance(CommentModel);
  }

  public async getCommentById(req: Request, res: Response, next: NextFunction) {
    const dto = plainToInstance(CommentIdParamDTO, req.params);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const target_id = dto.comment_id || dto.post_id;

    if (!target_id) {
      return res
        .status(400)
        .json({ errors: [{ message: "comment_id or post_id is required" }] });
    }

    return await this.commentService.getCommentById(target_id);
  }

  public async createComment(req: Request, res: Response, next: NextFunction) {
    const idDto = plainToInstance(CommentIdParamDTO, req.params);
    const contentDto = plainToInstance(CreateCommentBodyDTO, req.body);
    const idErrors = await validate(idDto);
    const contentErrors = await validate(contentDto);
    if (idErrors.length > 0 || contentErrors.length > 0) {
      return res.status(400).json({ errors: [...idErrors, ...contentErrors] });
    }

    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const target_id = this.resolveTargetId(idDto);

    return await this.commentService.createComment(
      target_id,
      req.user.id,
      contentDto.parent_id,
      contentDto.content
    );
  }

  public async updateComment(req: Request, res: Response, next: NextFunction) {
    const idDto = plainToInstance(CommentIdParamDTO, req.params);
    const contentDto = plainToInstance(UpdateCommentDTO, req.body);
    const idErrors = await validate(idDto);
    const contentErrors = await validate(contentDto);
    if (idErrors.length > 0 || contentErrors.length > 0) {
      return res.status(400).json({ errors: [...idErrors, ...contentErrors] });
    }

    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const target_id = this.resolveTargetId(idDto);
    const comment = await this.commentService.getCommentById(target_id);
    if (!comment) {
      return next(new NotFoundError("Comment not found"));
    }

    if (comment.user_id !== req.user.id) {
      return next(new ForbiddenError("You can only edit your own comments"));
    }

    return await this.commentService.updateComment(
      target_id,
      contentDto.content
    );
  }

  public async deleteComment(req: Request, res: Response, next: NextFunction) {
    const dto = plainToInstance(CommentIdParamDTO, req.params);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const target_id = this.resolveTargetId(dto);
    const comment = await this.commentService.getCommentById(target_id);
    if (!comment) {
      return next(new NotFoundError("Comment not found"));
    }

    if (comment.user_id !== req.user.id) {
      return next(new ForbiddenError("You can only delete your own comments"));
    }

    return await this.commentService.deleteComment(target_id);
  }

  private resolveTargetId(dto: CommentIdParamDTO): number {
    const target_id = dto.comment_id || dto.post_id;
    if (!target_id) {
      throw new BadRequestError("comment_id or post_id is required");
    }

    return target_id;
  }
}

export const commentController = new CommentController();
