import type { ResultSetHeader, RowDataPacket } from "mysql2";
import Database from "../../shared/database/index.js";
import type { CreatePostDTO, PostUpdateDTO } from "./post.dto.js";
import { QUERIES } from "../../shared/consts/queries.js";

type IPostStatus = "active" | "inactive";

type IPostModel = {
  id: number;
  user_id: number;
  title: string;
  content: string;
  status: IPostStatus;
  rating: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

type IPostFullDataModel = IPostModel & {
  categories: { id: number; title: string }[];
};

export class PostModel {
  private static instance: PostModel | null = null;
  private db: ReturnType<typeof Database.getPool>;
  private constructor() {
    this.db = Database.getPool();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new PostModel();
    }
    return this.instance;
  }

  public async createPost(userId: number, dto: CreatePostDTO) {
    let result: ResultSetHeader;
    try {
      [result] = await this.db.query<ResultSetHeader>(QUERIES.POST.CREATE, [
        userId,
        dto.title,
        dto.content
      ]);

      if (result.affectedRows === 0) {
        return null;
      }
    } catch (error) {
      console.error("Error creating post:", error);
      return null;
    }

    try {
      const categories = dto.categories.map((category) => [
        result.insertId,
        category
      ]);
      await this.db.query(QUERIES.POST.ADD_CATEGORIES, [categories]);
    } catch (error) {
      console.error("Error adding post categories:", error);
    }
    return { post_id: result.insertId, ...dto };
  }

  public async updatePost(postId: number, userId: number, dto: CreatePostDTO) {
    try {
      const [result] = await this.db.query<ResultSetHeader>(
        QUERIES.POST.UPDATE,
        [dto.title, dto.content, userId, postId]
      );
      if (result.affectedRows === 0) {
        return null;
      }
      return { ...dto };
    } catch (error) {
      console.error("Error updating post:", error);
      return null;
    }
  }

  public async deletePost(postId: number) {
    try {
      const [result] = await this.db.query<ResultSetHeader>(
        QUERIES.POST.DELETE,
        [postId]
      );
      if (result.affectedRows === 0) {
        return null;
      }
      return { postId };
    } catch (error) {
      console.error("Error deleting post:", error);
      return null;
    }
  }

  public async getPostById(postId: number) {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(QUERIES.POST.READ, [
        postId
      ]);

      return Array.isArray(rows) && rows.length > 0 && rows[0]
        ? (rows[0] as IPostModel)
        : null;
    } catch (error) {
      console.error("Error getting post by ID:", error);
      return null;
    }
  }
}
