import type { CommentModel } from "./comment.model.js";

export class CommentService {
  private static instance: CommentService | null = null;
  private commentModel: CommentModel;

  private constructor(comment: typeof CommentModel) {
    this.commentModel = comment.getInstance();
  }

  public static getInstance(comment: typeof CommentModel) {
    if (!this.instance) {
      this.instance = new CommentService(comment);
    }
    return this.instance;
  }

  public async getCommentById(id: number) {
    return this.commentModel.getCommentById(id);
  }

  public async createComment(
    post_id: number,
    user_id: number,
    parent_id: number | null,
    content: string
  ) {
    return this.commentModel.createComment(
      post_id,
      user_id,
      parent_id,
      content
    );
  }

  public async updateComment(id: number, content: string) {
    return this.commentModel.updateComment(id, content);
  }

  public async deleteComment(id: number) {
    return this.commentModel.deleteComment(id);
  }
}
