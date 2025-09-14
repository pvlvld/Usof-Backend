import type { RowDataPacket } from "mysql2";
import { QUERIES } from "../../shared/consts/queries.js";
import Database from "../../shared/database/index.js";

export class LikeModel {
  private static instance: LikeModel;
  private db: ReturnType<typeof Database.getPool>;

  private constructor() {
    this.db = Database.getPool();
  }

  public static getInstance(): LikeModel {
    if (!this.instance) {
      this.instance = new LikeModel();
    }
    return this.instance;
  }

  public async findOne(
    userId: number,
    postId: number | null,
    commentId: number | null
  ): Promise<{ is_like: boolean } | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(QUERIES.LIKE.READ, [
      userId,
      postId,
      commentId
    ]);
    if (!Array.isArray(rows)) return null;
    console.log(rows);
    return rows[0] ? { is_like: !!rows[0]?.is_like } : null;
  }

  public async findEntityLikes(
    postId: number | null,
    commentId: number | null
  ): Promise<Array<{ user_id: number; is_like: boolean }>> {
    if (postId === null && commentId === null) {
      return [];
    }

    let rows: RowDataPacket[] = [];

    if (postId) {
      [rows] = await this.db.query<RowDataPacket[]>(
        QUERIES.LIKE.READ_POST_LIKES,
        [postId]
      );
    } else {
      [rows] = await this.db.query<RowDataPacket[]>(
        QUERIES.LIKE.READ_COMMENT_LIKES,
        [commentId]
      );
    }

    if (!Array.isArray(rows)) return [];
    return rows.map((row) => ({
      user_id: row.user_id,
      is_like: !!row.is_like
    }));
  }

  public async upsert(
    userId: number,
    postId: number | null,
    commentId: number | null,
    isLike: boolean
  ): Promise<any> {
    return this.db.query(QUERIES.LIKE.UPSERT, [
      userId,
      postId,
      commentId,
      isLike
    ]);
  }

  public async delete(
    userId: number,
    postId: number | null,
    commentId: number | null
  ): Promise<any> {
    if (postId) {
      return this.db.query(QUERIES.LIKE.DELETE_POST_LIKE, [userId, postId]);
    } else if (commentId) {
      return this.db.query(QUERIES.LIKE.DELETE_COMMENT_LIKE, [
        userId,
        commentId
      ]);
    }
  }
}
