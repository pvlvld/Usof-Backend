import express from "express";
import { authRouter } from "./auth.router.js";
import { userRouter } from "./user.router.js";
import { postRouter } from "./post.router.js";
import { commentRouter } from "./comment.router.js";
import { categoryRouter } from "./category.router.js";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/posts", postRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/comments", commentRouter);

export { apiRouter };
