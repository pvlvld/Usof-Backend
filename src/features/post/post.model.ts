import type { ResultSetHeader } from "mysql2";
import Database from "../../shared/database/index.js";
import type { CreatePostDTO } from "./post.dto.js";
import { QUERIES } from "../../shared/consts/queries.js";

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

  public async createPost(dto: CreatePostDTO) {
    let result: ResultSetHeader;
    try {
      [result] = await this.db.query<ResultSetHeader>(QUERIES.POST.CREATE, [
        dto.user_id,
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
}
