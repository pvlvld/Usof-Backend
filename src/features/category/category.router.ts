import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";
import { categoryController } from "./category.controller.js";
import {
  authenticateMiddleware,
  requireAdminMiddleware
} from "../../shared/middlewares/auth.middleware.js";

const categoryRouter = express.Router();

categoryRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    await categoryController.getCategories(req, res, next);
  }
);

categoryRouter.get(
  "/:category_id",
  async (req: Request, res: Response, next: NextFunction) => {
    await categoryController.getCategoryById(req, res, next);
  }
);

categoryRouter.get(
  "/:category_id/posts",
  async (req: Request, res: Response, next: NextFunction) => {
    await categoryController.getPostsByCategoryId(req, res, next);
  }
);

categoryRouter.post(
  "/",
  authenticateMiddleware,
  requireAdminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    await categoryController.createCategory(req, res, next);
  }
);

categoryRouter.patch(
  "/:category_id",
  authenticateMiddleware,
  requireAdminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    await categoryController.updateCategory(req, res, next);
  }
);

categoryRouter.delete(
  "/:category_id",
  authenticateMiddleware,
  requireAdminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    await categoryController.deleteCategory(req, res, next);
  }
);

export { categoryRouter };
