import { NotFoundError } from "../../shared/consts/errors.js";
import type { PostIdDTO } from "./post.dto.js";
import type { PostModel } from "./post.model.js";

export class PostService {
  private static instance: PostService | null = null;
  private postModel: PostModel;

  private constructor(post: typeof PostModel) {
    this.postModel = post.getInstance();
  }

  public static getInstance(post: typeof PostModel) {
    if (!this.instance) {
      this.instance = new PostService(post);
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
}
