import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";
import { likeRouter } from "../like/like.router.js";

const commentRouter = express.Router();

commentRouter.get(
  "/:comment_id",
  (req: Request, res: Response, next: NextFunction) => {
    const { comment_id } = req.params;
    res.json({ message: `Comment ${comment_id}` });
  }
);

commentRouter.use("/:comment_id/like", likeRouter);
commentRouter.use("/:comment_id/dislike", likeRouter);

commentRouter.patch(
  "/:comment_id",
  (req: Request, res: Response, next: NextFunction) => {
    const { comment_id } = req.params;
    // Extract updated comment data from request body
    res.json({ message: `Comment ${comment_id} updated` });
  }
);

commentRouter.delete(
  "/:comment_id",
  (req: Request, res: Response, next: NextFunction) => {
    const { comment_id } = req.params;
    res.json({ message: `Comment ${comment_id} deleted` });
  }
);

export { commentRouter };
