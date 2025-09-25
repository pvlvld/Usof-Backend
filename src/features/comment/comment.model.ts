import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { QUERIES } from "../../shared/consts/queries.js";
import Database from "../../shared/database/index.js";

export type ICommentModel = {
  id: number;
  post_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  status: "active" | "inactive";
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export class CommentModel {
  private static instance: CommentModel | null = null;
  private db: ReturnType<typeof Database.getPool>;

  private deletedCommentTemplate: Partial<ICommentModel> = {
    user_id: 0,
    content: "[deleted]"
  };
  private constructor() {
    this.db = Database.getPool();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new CommentModel();
    }
    return this.instance;
  }

  public async getCommentById(id: number) {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(
        QUERIES.COMMENT.READ,
        [id]
      );

      if (!rows || rows.length === 0) {
        return null;
      }

      if (rows[0]?.deleted_at) {
        return <ICommentModel>(
          Object.assign(rows[0], this.deletedCommentTemplate)
        );
      }

      return null;
    } catch (error) {
      console.error("Error fetching comment by ID:", error);
      return null;
    }
  }

  public async getCommentsByPostId(post_id: number) {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(
        QUERIES.COMMENT.READ_POST_COMMENTS,
        [post_id]
      );
      return rows;
    } catch (error) {
      console.error("Error fetching comments by post ID:", error);
      return [];
    }
  }

  public async getCommentsByUserId(user_id: number) {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(
        QUERIES.COMMENT.READ_USER_COMMENTS,
        [user_id]
      );
      return rows;
    } catch (error) {
      console.error("Error fetching comments by user ID:", error);
      return [];
    }
  }

  public async createComment(
    post_id: number,
    user_id: number,
    parent_id: number | null,
    content: string
  ) {
    try {
      const [result] = await this.db.execute<ResultSetHeader>(
        QUERIES.COMMENT.CREATE,
        [post_id, user_id, parent_id, content]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error creating comment:", error);
      return null;
    }
  }

  public async updateComment(id: number, content: string): Promise<boolean> {
    try {
      const [result] = await this.db.execute<ResultSetHeader>(
        QUERIES.COMMENT.UPDATE,
        [content, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating comment:", error);
      return false;
    }
  }

  public async deleteComment(id: number): Promise<boolean> {
    try {
      const [result] = await this.db.execute<ResultSetHeader>(
        QUERIES.COMMENT.DELETE,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting comment:", error);
      return false;
    }
  }
}
