import { BadRequestError } from "../../shared/consts/errors.js";
import type { LikeModel } from "./like.model.js";

export type LikeServiceResult = {
  status: number;
  message: string;
};

export class LikeService {
  private static instance: LikeService;
  private likeModel: LikeModel;
  private constructor(like: typeof LikeModel) {
    this.likeModel = like.getInstance();
  }
  public static getInstance(like: typeof LikeModel) {
    if (!this.instance) {
      this.instance = new LikeService(like);
    }
    return this.instance;
  }

  public async getEntityLikes(
    postId: number | null,
    commentId: number | null
  ): Promise<Array<{ user_id: number; is_like: boolean }>> {
    if (!postId && !commentId) {
      throw new BadRequestError("Either postId or commentId must be provided");
    }

    return this.likeModel.findEntityLikes(postId, commentId);
  }

  public async handleLike(
    user: Express.UserInfo,
    postId: number | null,
    commentId: number | null,
    isLike: boolean
  ): Promise<LikeServiceResult> {
    if (!postId && !commentId) {
      throw new BadRequestError("Either postId or commentId must be provided");
    }

    const userId = user.id;
    await this.likeModel.upsert(userId, postId, commentId, isLike);
    return {
      status: 200,
      message: isLike ? "Liked" : "Disliked"
    };
  }

  public async handleUnsetLike(
    user: Express.UserInfo,
    postId: number | null,
    commentId: number | null
  ): Promise<LikeServiceResult> {
    const userId = user.id;
    await this.likeModel.delete(userId, postId, commentId);
    return {
      status: 200,
      message: "Like/Dislike removed"
    };
  }
}
