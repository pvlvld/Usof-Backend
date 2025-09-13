import type { NextFunction, Request, Response } from "express";
import { PostModel } from "./post.model.js";
import { PostService } from "./post.service.js";
import { plainToInstance } from "class-transformer";
import { PostIdDTO } from "./post.dto.js";
import { validate } from "class-validator";

class PostController {
  private postService: PostService;
  constructor() {
    this.postService = PostService.getInstance(PostModel);
  }

  public async getPostById(req: Request, res: Response, next: NextFunction) {
    const dto = plainToInstance(PostIdDTO, req.params);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const post = await this.postService.getPostById(dto);
      res.json(post);
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();
