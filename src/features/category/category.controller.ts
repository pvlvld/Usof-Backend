import type { NextFunction, Request, Response } from "express";
import {
  CategoryIdDto,
  CreateCategoryDto,
  GetCategoriesDto,
  UpdateCategoryDto
} from "./category.dto.js";
import { CategoryModel } from "./category.model.js";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CategoryService } from "./category.service.js";
import { NotFoundError } from "../../shared/consts/errors.js";

class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = CategoryService.getInstance(CategoryModel);
  }

  public async getCategories(req: Request, res: Response, next: NextFunction) {
    // req.query ??= {};
    // const dto: GetCategoriesDto = plainToInstance(GetCategoriesDto, req.query);
    // const errors = await validate(dto);
    // if (errors.length > 0) {
    //   return res.status(400).json({ errors });
    // }

    try {
      return res.status(200).json(await this.categoryService.getCategories());
    } catch (err) {
      next(err);
    }
  }

  public async getCategoryById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const dto: CategoryIdDto = plainToInstance(CategoryIdDto, req.params);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const category = await this.categoryService.getCategoryById(
        dto.category_id
      );
      if (!category) {
        return next(new NotFoundError("Category not found"));
      }
      return res.status(200).json(category);
    } catch (err) {
      next(err);
    }
  }

  public async createCategory(req: Request, res: Response, next: NextFunction) {
    const dto: CreateCategoryDto = plainToInstance(CreateCategoryDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const category = await this.categoryService.createCategory(dto);
      return res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  }

  public async updateCategory(req: Request, res: Response, next: NextFunction) {
    const categoryIdDto: CategoryIdDto = plainToInstance(
      CategoryIdDto,
      req.params
    );
    const idErrors = await validate(categoryIdDto);
    if (idErrors.length > 0) {
      return res.status(400).json({ errors: idErrors });
    }

    const dataDto: UpdateCategoryDto = plainToInstance(
      UpdateCategoryDto,
      req.body
    );
    const errors = await validate(dataDto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const category = await this.categoryService.updateCategory(
        categoryIdDto.category_id,
        dataDto
      );
      return res.status(200).json(category);
    } catch (err) {
      next(err);
    }
  }

  public async deleteCategory(req: Request, res: Response, next: NextFunction) {
    const categoryIdDto: CategoryIdDto = plainToInstance(
      CategoryIdDto,
      req.params
    );
    const idErrors = await validate(categoryIdDto);
    if (idErrors.length > 0) {
      return res.status(400).json({ errors: idErrors });
    }

    try {
      await this.categoryService.deleteCategory(categoryIdDto.category_id);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const categoryController = new CategoryController();
