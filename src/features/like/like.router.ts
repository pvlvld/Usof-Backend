import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";
import { likeController } from "./like.controller.js";
import { authenticateMiddleware } from "../../shared/middlewares/auth.middleware.js";

const likeRouter = express.Router({ mergeParams: true });

likeRouter.post(
  "/",
  authenticateMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    likeController.handleLikeAction(req, res, next);
  }
);

likeRouter.delete(
  "/",
  authenticateMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    likeController.handleUnsetLikeAction(req, res, next);
  }
);

export { likeRouter };
