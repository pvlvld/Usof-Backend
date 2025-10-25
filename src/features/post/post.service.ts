import {
  ForbiddenError,
  GoneError,
  NotFoundError
} from "../../shared/consts/errors.js";
import type { AiAnswerService } from "../../shared/services/aiAnswer.service.js";
import type { CategoryModel } from "../category/category.model.js";
import type { CommentModel } from "../comment/comment.model.js";
import type {
  CreatePostDTO,
  GetPostsDto,
  PostIdDTO,
  PostUpdateDTO
} from "./post.dto.js";
import type { PostModel } from "./post.model.js";

export class PostService {
  private static instance: PostService | null = null;
  private postModel: PostModel;
  private categoryModel: CategoryModel;
  private commentModel: CommentModel;
  private aiAnswerService: AiAnswerService;

  private constructor(
    post: typeof PostModel,
    category: typeof CategoryModel,
    comment: typeof CommentModel,
    aiAnswerService: typeof AiAnswerService
  ) {
    this.postModel = post.getInstance();
    this.categoryModel = category.getInstance();
    this.commentModel = comment.getInstance();
    this.aiAnswerService = aiAnswerService.getInstance(comment);
  }

  public static getInstance(
    post: typeof PostModel,
    category: typeof CategoryModel,
    comment: typeof CommentModel,
    aiAnswerService: typeof AiAnswerService
  ) {
    if (!this.instance) {
      this.instance = new PostService(post, category, comment, aiAnswerService);
    }
    return this.instance;
  }

  public async createPost(dto: CreatePostDTO, user_id: number) {
    const post = await this.postModel.createPost(user_id, dto);

    if (post && post.id) {
      this.aiAnswerService.postAiAnswer(post.id, dto.content).catch((err) => {
        console.error(`Failed to post AI answer for post ID ${post.id}:`, err);
      });
    }

    return post;
  }

  public async updatePost(
    idDto: PostIdDTO,
    updateDto: PostUpdateDTO,
    user: Express.UserInfo
  ) {
    const post = await this.postModel.getPostById(idDto.post_id, user.id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    // Not even admin can update someone else's post. As per requirements.
    if (post.user_id !== user.id) {
      throw new ForbiddenError("You can only update your own posts");
    }

    const postData = <PostUpdateDTO>Object.assign({}, post, updateDto);
    const res = await this.postModel.updatePost(idDto.post_id, postData);
    return res;
  }

  public async getPostMany(dto: GetPostsDto, viewerId: number) {
    return await this.postModel.getPostMany(dto, viewerId);
  }

  public async getPostById(dto: PostIdDTO, viewerId: number) {
    const post = await this.postModel.getPostById(dto.post_id, viewerId);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    return post;
  }

  public async deletePost(dto: PostIdDTO, user: Express.UserInfo) {
    const post = await this.postModel.getPostById(dto.post_id, 0);

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

  public async getPostCategories(dto: PostIdDTO) {
    const post = await this.postModel.getPostById(dto.post_id, 0);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    return await this.categoryModel.getPostCategories(dto.post_id);
  }

  public async getPostComments(dto: PostIdDTO, viewerId: number) {
    const post = await this.postModel.getPostById(dto.post_id, 0);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    return await this.commentModel.getCommentsByPostId(dto.post_id, viewerId);
  }
}
