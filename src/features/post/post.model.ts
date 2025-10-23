import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { UnsafeQueryError } from "../../shared/consts/errors.js";
import { QUERIES } from "../../shared/consts/queries.js";
import Database from "../../shared/database/index.js";
import type { CreatePostDTO, GetPostsDto } from "./post.dto.js";

type IPostStatus = "active" | "inactive";

export type IPostModel = {
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

type IPostWithCommentsCount = IPostModel & {
  comments_count: number;
};

type IPostFullData = IPostWithCommentsCount & {
  author: {
    id: number;
    login: string;
  };
  categories: { id: number; title: string; description: string | null }[];
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

  public async getPostMany(dto: GetPostsDto) {
    const offset = (dto.page - 1) * dto.limit;
    let categories: string[] = [];
    if (dto.categories !== "all") {
      categories = dto.categories
        .split(",")
        .map((cat) => cat.trim())
        .filter((cat) => cat.length > 0);
    }

    const params: (string | number)[] = [
      dto.searchQuery,
      dto.searchQuery,
      dto.status === "all" ? undefined : dto.status,
      dto.user > 0 ? dto.user : undefined,
      ...(categories.length > 0 ? categories : [])
    ].filter((p) => p !== undefined);

    try {
      const query = QUERIES.POST.GET_PAGINATED(
        dto.sort,
        dto.order,
        dto.limit,
        offset,
        dto.status,
        dto.user > 0 ? dto.user : undefined,
        categories.length > 0 ? categories : undefined,
        dto.from_date,
        dto.to_date,
        dto.searchQuery
      );

      if (query.includes("--") || query.includes(";")) {
        throw new UnsafeQueryError(query);
      }

      const res = await this.db.query<RowDataPacket[]>(query, params);

      const posts = Array.isArray(res[0])
        ? (res[0] as IPostFullData[])
        : ([] as IPostFullData[]);

      return posts;
    } catch (error) {
      console.error("Error getting paginated posts:", error);
      return [];
    }
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
    return { id: result.insertId, ...dto };
  }

  public async updatePost(
    postId: number,
    userId: number,
    dto: { title: string; content: string; categories: number[] | null }
  ) {
    try {
      const [result] = await this.db.query<ResultSetHeader>(
        QUERIES.POST.UPDATE,
        [dto.title, dto.content, userId, postId]
      );
      if (result.affectedRows === 0) {
        return null;
      }

      if (dto.categories) {
        await this.db.query(QUERIES.POST.REMOVE_ALL_CATEGORIES, [postId]);
        const categories = dto.categories.map((category) => [postId, category]);
        if (categories.length > 0) {
          await this.db.query(QUERIES.POST.ADD_CATEGORIES, [categories]);
        }
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
        ? (rows[0] as IPostWithCommentsCount)
        : null;
    } catch (error) {
      console.error("Error getting post by ID:", error);
      return null;
    }
  }
}
