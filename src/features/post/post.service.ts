import {
  ForbiddenError,
  GoneError,
  NotFoundError
} from "../../shared/consts/errors.js";
import type { CategoryModel } from "../category/category.model.js";
import type { PostIdDTO } from "./post.dto.js";
import type { PostModel } from "./post.model.js";

export class PostService {
  private static instance: PostService | null = null;
  private postModel: PostModel;
  private categoryModel: CategoryModel;

  private constructor(post: typeof PostModel, category: typeof CategoryModel) {
    this.postModel = post.getInstance();
    this.categoryModel = category.getInstance();
  }

  public static getInstance(
    post: typeof PostModel,
    category: typeof CategoryModel
  ) {
    if (!this.instance) {
      this.instance = new PostService(post, category);
    }
    return this.instance;
  }

  public async getPostById(dto: PostIdDTO) {
    const post = await this.postModel.getPostById(dto.post_id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    return post;
  }

  public async deletePost(dto: PostIdDTO, user: Express.UserInfo) {
    const post = await this.postModel.getPostById(dto.post_id);

    if (!post) {
      throw new NotFoundError("Post not found");
    }
    if (post.deleted_at) {
      throw new GoneError("Post already deleted");
    }
    if (post.user_id !== user.id && user.role !== "admin") {
      throw new ForbiddenError("You can delete only your own posts");
    }

    const result = await this.postModel.deletePost(dto.post_id);
    if (!result) {
      throw new NotFoundError("Post not found");
    }

    return result;
  }
}
