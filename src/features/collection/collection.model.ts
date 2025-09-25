import type { ResultSetHeader, RowDataPacket } from "mysql2";
import Database from "../../shared/database/index.js";
import { QUERIES } from "../../shared/consts/queries.js";
import type {
  CreateCollectionDTO,
  UpdateCollectionDTO
} from "./collection.dto.js";

export type ICollectionModel = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

export type ICollectionWithPostsModel = ICollectionModel & {
  posts: {
    id: number;
    title: string;
    content: string;
    rating: number;
    created_at: Date;
    added_at: Date;
  }[];
};

export class CollectionModel {
  private static instance: CollectionModel | null = null;
  private db: ReturnType<typeof Database.getPool>;

  private constructor() {
    this.db = Database.getPool();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new CollectionModel();
    }
    return this.instance;
  }

  public async createCollection(
    userId: number,
    dto: CreateCollectionDTO
  ): Promise<ICollectionModel | null> {
    try {
      const [result] = await this.db.query<ResultSetHeader>(
        QUERIES.COLLECTION.CREATE,
        [userId, dto.name, dto.description || null]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return {
        id: result.insertId,
        user_id: userId,
        name: dto.name,
        description: dto.description || null,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error) {
      console.error("Error creating collection:", error);
      return null;
    }
  }

  public async getCollectionsByUserId(
    userId: number
  ): Promise<ICollectionModel[]> {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(
        QUERIES.COLLECTION.GET_BY_USER_ID,
        [userId]
      );

      return Array.isArray(rows) ? (rows as ICollectionModel[]) : [];
    } catch (error) {
      console.error("Error getting collections by user ID:", error);
      return [];
    }
  }

  public async getCollectionByName(
    userId: number,
    name: string
  ): Promise<ICollectionModel | null> {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(
        QUERIES.COLLECTION.GET_BY_NAME,
        [userId, name]
      );

      return Array.isArray(rows) && rows.length > 0 && rows[0]
        ? (rows[0] as ICollectionModel)
        : null;
    } catch (error) {
      console.error("Error getting collection by name:", error);
      return null;
    }
  }

  public async getCollectionWithPosts(
    userId: number,
    name: string
  ): Promise<ICollectionWithPostsModel | null> {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(
        QUERIES.COLLECTION.GET_WITH_POSTS,
        [userId, name]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return null;
      }

      const collection = rows[0] as ICollectionModel;
      const posts = rows
        .filter((row) => row.post_id !== null)
        .map((row) => ({
          id: row.post_id,
          title: row.title,
          content: row.content,
          rating: row.rating,
          created_at: row.post_created_at,
          added_at: row.added_at
        }));

      return {
        ...collection,
        posts
      };
    } catch (error) {
      console.error("Error getting collection with posts:", error);
      return null;
    }
  }

  public async updateCollection(
    userId: number,
    name: string,
    dto: UpdateCollectionDTO
  ): Promise<ICollectionModel | null> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      if (dto.name !== undefined) {
        updateFields.push("name = ?");
        values.push(dto.name);
      }

      if (dto.description !== undefined) {
        updateFields.push("description = ?");
        values.push(dto.description);
      }

      if (updateFields.length === 0) {
        return null;
      }

      values.push(userId, name);

      const [result] = await this.db.query<ResultSetHeader>(
        QUERIES.COLLECTION.UPDATE(updateFields.join(", ")),
        values
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.getCollectionByName(userId, dto.name || name);
    } catch (error) {
      console.error("Error updating collection:", error);
      return null;
    }
  }

  public async deleteCollection(
    userId: number,
    name: string
  ): Promise<boolean> {
    try {
      const [result] = await this.db.query<ResultSetHeader>(
        QUERIES.COLLECTION.DELETE,
        [userId, name]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting collection:", error);
      return false;
    }
  }

  public async addPostToCollection(
    userId: number,
    collectionName: string,
    postId: number
  ): Promise<boolean> {
    try {
      const collection = await this.getCollectionByName(userId, collectionName);
      if (!collection) {
        return false;
      }

      const [postRows] = await this.db.query<RowDataPacket[]>(
        QUERIES.COLLECTION.CHECK_POST_EXISTS,
        [postId]
      );

      if (!Array.isArray(postRows) || postRows.length === 0) {
        return false;
      }

      const [result] = await this.db.query<ResultSetHeader>(
        QUERIES.COLLECTION.ADD_POST,
        [collection.id, postId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error adding post to collection:", error);
      return false;
    }
  }

  public async removePostFromCollection(
    userId: number,
    collectionName: string,
    postId: number
  ): Promise<boolean> {
    try {
      const collection = await this.getCollectionByName(userId, collectionName);
      if (!collection) {
        return false;
      }

      const [result] = await this.db.query<ResultSetHeader>(
        QUERIES.COLLECTION.REMOVE_POST,
        [collection.id, postId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error removing post from collection:", error);
      return false;
    }
  }
}
