import type { NextFunction, Request, Response } from "express";
import { LikeModel } from "./like.model.js";
import { LikeService } from "./like.service.js";
import { BadRequestError } from "../../shared/consts/errors.js";

type ILikeAction = "like" | "dislike";

class LikeController {
  private likeService: LikeService;
  constructor() {
    this.likeService = LikeService.getInstance(LikeModel);
  }

  public async handleLikeAction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { post_id, comment_id } = req.params;
    const target_id = parseInt(post_id ?? comment_id ?? "", 10);
    if (isNaN(target_id)) {
      if (!!post_id) {
        next(new BadRequestError("Invalid post ID"));
      } else {
        next(new BadRequestError("Invalid comment ID"));
      }
    }

    req.body ??= {};
    req.body.action ??= "like";
    if (!["like", "dislike"].includes(req.body.action || "")) {
      req.body.action = "like";
    }
    const action: ILikeAction = req.body.action;

    let targetType = "";
    if (req.baseUrl.includes("/posts")) {
      targetType = "post";
    } else if (req.baseUrl.includes("/comments")) {
      targetType = "comment";
    } else {
      next(
        new BadRequestError(
          "Like action must be associated with a post or comment"
        )
      );
    }

    try {
      const result = await this.likeService.handleLike(
        req.user!,
        Number(post_id) || null,
        Number(comment_id) || null,
        action === "like"
      );
      return res.status(result.status).json({ message: result.message });
    } catch (err) {
      next(err);
    }
  }

  public async handleUnsetLikeAction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { post_id, comment_id } = req.params;
    const target_id = parseInt(post_id ?? comment_id ?? "", 10);
    if (isNaN(target_id)) {
      if (!!post_id) {
        next(new BadRequestError("Invalid post ID"));
      } else {
        next(new BadRequestError("Invalid comment ID"));
      }
    }

    try {
      const result = await this.likeService.handleUnsetLike(
        req.user!,
        Number(post_id) || null,
        Number(comment_id) || null
      );
      return res.status(result.status).json({ message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

export const likeController = new LikeController();
