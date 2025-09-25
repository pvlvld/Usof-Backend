import type { NextFunction, Request, Response } from "express";
import { PostModel } from "./post.model.js";
import { PostService } from "./post.service.js";
import { plainToInstance } from "class-transformer";
import {
  CreatePostDTO,
  GetPostsDto,
  PostIdDTO,
  PostUpdateDTO
} from "./post.dto.js";
import { validate } from "class-validator";
import { CategoryModel } from "../category/category.model.js";
import { CommentModel } from "../comment/comment.model.js";
import { UnauthorizedError } from "../../shared/consts/errors.js";

class PostController {
  private postService: PostService;
  constructor() {
    this.postService = PostService.getInstance(
      PostModel,
      CategoryModel,
      CommentModel
    );
  }

  public async createPost(req: Request, res: Response, next: NextFunction) {
    const dto = plainToInstance(CreatePostDTO, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (!req.user) {
      return next(new UnauthorizedError());
    }

    try {
      const post = await this.postService.createPost(dto, req.user.id);
      return res.status(201).json(post);
    } catch (error) {
      return next(error);
    }
  }

  public async updatePost(req: Request, res: Response, next: NextFunction) {
    const idDto = plainToInstance(PostIdDTO, req.params);
    const bodyDto = plainToInstance(PostUpdateDTO, req.body);
    const idErrors = await validate(idDto);
    const bodyErrors = await validate(bodyDto);
    if (idErrors.length > 0 || bodyErrors.length > 0) {
      return res.status(400).json({ errors: [...idErrors, ...bodyErrors] });
    }

    if (!req.user) {
      console.error(
        "[PostController.updatePost] No user auth data in request object."
      );
      return next(new UnauthorizedError());
    }

    try {
      const post = await this.postService.updatePost(idDto, bodyDto, req.user);
      return res.status(200).json(post);
    } catch (error) {
      return next(error);
    }
  }

  public async getPostMany(req: Request, res: Response, next: NextFunction) {
    const dto = plainToInstance(GetPostsDto, req.query);
    const errors = await validate(dto, {
      forbidNonWhitelisted: true,
      whitelist: true
    });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const posts = await this.postService.getPostMany(dto);
      return res.json(posts);
    } catch (error) {
      return next(error);
    }
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

  public async getPostCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const dto = plainToInstance(PostIdDTO, req.params);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const categories = await this.postService.getPostCategories(dto);
      return res.status(200).json(categories);
    } catch (error) {
      return next(error);
    }
  }

  public async getPostComments(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const dto = plainToInstance(PostIdDTO, req.params);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const comments = await this.postService.getPostComments(dto);
      return res.status(200).json(comments);
    } catch (error) {
      return next(error);
    }
  }
}

export const postController = new PostController();
