import type { NextFunction, Request, Response } from "express";
import { CommentModel } from "./comment.model.js";
import { CommentService } from "./comment.service.js";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  CommentIdDTO,
  CreateCommentDTO,
  UpdateCommentDTO
} from "./comment.dto.js";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError
} from "../../shared/consts/errors.js";

class CommentController {
  private commentService: CommentService;
  constructor() {
    this.commentService = CommentService.getInstance(CommentModel);
  }

  public async getCommentById(id: number) {
    return this.commentService.getCommentById(id);
  }

  public async createComment(req: Request, res: Response, next: NextFunction) {
    const idDto = plainToInstance(CommentIdDTO, req.params);
    const contentDto = plainToInstance(CreateCommentDTO, req.body);
    const idErrors = await validate(idDto);
    const contentErrors = await validate(contentDto);
    if (idErrors.length > 0 || contentErrors.length > 0) {
      return res.status(400).json({ errors: [...idErrors, ...contentErrors] });
    }

    if (!req.user) {
      return next(new UnauthorizedError());
    }

    return this.commentService.createComment(
      idDto.comment_id,
      req.user.id,
      contentDto.parent_id,
      contentDto.content
    );
  }

  public async updateComment(req: Request, res: Response, next: NextFunction) {
    const idDto = plainToInstance(CommentIdDTO, req.params);
    const contentDto = plainToInstance(UpdateCommentDTO, req.body);
    const idErrors = await validate(idDto);
    const contentErrors = await validate(contentDto);
    if (idErrors.length > 0 || contentErrors.length > 0) {
      return res.status(400).json({ errors: [...idErrors, ...contentErrors] });
    }

    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const comment = await this.commentService.getCommentById(idDto.comment_id);
    if (!comment) {
      return next(new NotFoundError("Comment not found"));
    }

    if (comment.user_id !== req.user.id) {
      return next(new ForbiddenError("You can only edit your own comments"));
    }

    return await this.commentService.updateComment(
      idDto.comment_id,
      contentDto.content
    );
  }

  public async deleteComment(req: Request, res: Response, next: NextFunction) {
    const dto = plainToInstance(CommentIdDTO, req.params);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const comment = await this.commentService.getCommentById(dto.comment_id);
    if (!comment) {
      return next(new NotFoundError("Comment not found"));
    }

    if (comment.user_id !== req.user.id) {
      return next(new ForbiddenError("You can only delete your own comments"));
    }

    return await this.commentService.deleteComment(dto.comment_id);
  }
}

export const commentController = new CommentController();
