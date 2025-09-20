import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { QUERIES } from "../../shared/consts/queries.js";
import Database from "../../shared/database/index.js";
import type { CreateCategoryDto, UpdateCategoryDto } from "./category.dto.js";

type ICategory = {
  id: number;
  title: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

export class CategoryModel {
  private static instance: CategoryModel | null = null;
  private db: ReturnType<typeof Database.getPool>;
  private constructor() {
    this.db = Database.getPool();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new CategoryModel();
    }
    return this.instance;
  }

  public async createCategory(dto: CreateCategoryDto) {
    try {
      const [result] = await this.db.query<ResultSetHeader>(
        QUERIES.CATEGORY.CREATE,
        [dto.title, dto.description]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error creating category:", error);
      throw new Error("Database error");
    }
  }

  public async getAllCategories() {
    const [rows] = await this.db.query<RowDataPacket[]>(
      QUERIES.CATEGORY.GET_ALL
    );
    return rows as ICategory[];
  }

  public async getCategoryById(category_id: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(QUERIES.CATEGORY.READ, [
      category_id
    ]);
    return rows[0] as ICategory | null;
  }

  public async updateCategory(
    category_id: number,
    data: Pick<ICategory, "title" | "description">
  ) {
    const [result] = await this.db.query<ResultSetHeader>(
      QUERIES.CATEGORY.UPDATE,
      [data.title, data.description, category_id]
    );
    return result.affectedRows > 0;
  }

  public async deleteCategory(category_id: number) {
    const [result] = await this.db.query<ResultSetHeader>(
      QUERIES.CATEGORY.DELETE,
      [category_id]
    );
    return result.affectedRows > 0;
  }

  public async getCategoryPosts(category_id: number) {
    throw new Error("Method not implemented.");
  }
}
