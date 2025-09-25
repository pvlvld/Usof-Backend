import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";
import { likeRouter } from "../like/like.router.js";
import { commentController } from "./comment.controller.js";
import { authenticateMiddleware } from "../../shared/middlewares/auth.middleware.js";

const commentRouter = express.Router({ mergeParams: true });

commentRouter.get(
  "/:comment_id",
  (req: Request, res: Response, next: NextFunction) => {
    commentController.getCommentById(req, res, next);
  }
);

commentRouter.use("/:comment_id/like", likeRouter);
commentRouter.use("/:comment_id/dislike", likeRouter);

commentRouter.patch(
  "/:comment_id",
  authenticateMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    commentController.updateComment(req, res, next);
  }
);

commentRouter.delete(
  "/:comment_id",
  authenticateMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    commentController.deleteComment(req, res, next);
  }
);

export { commentRouter };
