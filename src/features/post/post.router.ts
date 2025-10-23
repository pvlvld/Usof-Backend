import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";
import { postController } from "./post.controller.js";
import { authenticateMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { likeRouter } from "../like/like.router.js";
import { commentController } from "../comment/comment.controller.js";

const postRouter = express.Router();

postRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  postController.getPostMany(req, res, next);
});

postRouter.get(
  "/:post_id",
  (req, res, next) => authenticateMiddleware(req, res, next, true),
  (req: Request, res: Response, next: NextFunction) => {
    postController.getPostById(req, res, next);
  }
);

postRouter.get(
  "/:post_id/comments",
  (req: Request, res: Response, next: NextFunction) => {
    postController.getPostComments(req, res, next);
  }
);

postRouter.post(
  "/:post_id/comments",
  authenticateMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    commentController.createComment(req, res, next);
  }
);

postRouter.get(
  "/:post_id/categories",
  (req: Request, res: Response, next: NextFunction) => {
    postController.getPostCategories(req, res, next);
  }
);

postRouter.use("/:post_id/like", likeRouter);
postRouter.use("/:post_id/dislike", likeRouter);

postRouter.post(
  "/",
  authenticateMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    postController.createPost(req, res, next);
  }
);

// POST CREATOR ONLY
postRouter.patch(
  "/:post_id",
  authenticateMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    postController.updatePost(req, res, next);
  }
);

postRouter.delete(
  "/:post_id",
  authenticateMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    postController.deletePost(req, res, next);
  }
);

// Act: Creative

postRouter.get(
  "/favorites",
  (req: Request, res: Response, next: NextFunction) => {
    res.send("List of favorite posts");
  }
);

postRouter.post(
  "/:post_id/subscribe",
  (req: Request, res: Response, next: NextFunction) => {
    res.send(`Subscribed to post ${req.params.post_id}`);
  }
);

export { postRouter };
