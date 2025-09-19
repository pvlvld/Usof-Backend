import { NotFoundError } from "../../shared/consts/errors.js";
import type { CreateCategoryDto, UpdateCategoryDto } from "./category.dto.js";
import { CategoryModel } from "./category.model.js";

class CategoryService {
  private static instance: CategoryService | null = null;
  private categoryModel: CategoryModel;

  private constructor(category: typeof CategoryModel) {
    this.categoryModel = category.getInstance();
  }

  public static getInstance(category: typeof CategoryModel) {
    if (!this.instance) {
      this.instance = new CategoryService(category);
    }
    return this.instance;
  }

  public async getCategories() {
    return await this.categoryModel.getAllCategories();
  }

  public async getCategoryById(category_id: number) {
    return await this.categoryModel.getCategoryById(category_id);
  }

  public async createCategory(dto: CreateCategoryDto) {
    return await this.categoryModel.createCategory(dto);
  }

  public async updateCategory(category_id: number, dto: UpdateCategoryDto) {
    const category = await this.categoryModel.getCategoryById(category_id);

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    Object.keys(dto).forEach((key) => {
      if (dto[key] === null) {
        category[key] = null;
      } else if (dto[key] !== undefined) {
        category[key] = dto[key];
      }
    });

    await this.categoryModel.updateCategory(category_id, category);
    return category;
  }

  public async deleteCategory(category_id: number) {
    const isDeleted = await this.categoryModel.deleteCategory(category_id);
    if (!isDeleted) {
      throw new NotFoundError("Category not found");
    }
    return isDeleted;
  }
}

export { CategoryService };
