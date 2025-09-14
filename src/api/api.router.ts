import express from "express";
import { authRouter } from "../features/auth/auth.router.js";
import { userRouter } from "../features/user/user.router.js";
import { postRouter } from "../features/post/post.router.js";
import { commentRouter } from "../features/comment/comment.router.js";
import { categoryRouter } from "../features/category/category.router.js";
import { likeRouter } from "../features/like/like.router.js";

const apiRouter = express.Router();

commentRouter.use("/:comment_id/like", likeRouter);

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/posts", postRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/comments", commentRouter);

export { apiRouter };
