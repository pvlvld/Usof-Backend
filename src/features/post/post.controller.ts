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

      if (post.deleted_at && req.user?.role !== "admin") {
        return res.status(410).json({ message: "Post has been deleted" });
      }

      return res.json(post);
    } catch (error) {
      return next(error);
    }
  }

  public async deletePost(req: Request, res: Response, next: NextFunction) {
    const dto = plainToInstance(PostIdDTO, req.params);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (!req.user) {
      console.error(
        "[PostController.deletePost] No user auth data in request object."
      );
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      await this.postService.deletePost(dto, req.user!);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

export const postController = new PostController();
