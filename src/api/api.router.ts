import express from "express";
import { authRouter } from "../features/auth/auth.router.js";
import { userRouter } from "../features/user/user.router.js";
import { postRouter } from "../features/post/post.router.js";
import { commentRouter } from "../features/comment/comment.router.js";
import { categoryRouter } from "../features/category/category.router.js";
import { collectionRouter } from "../features/collection/collection.router.js";
import { uploadRouter } from "../features/upload/upload.router.js";
import { statsRouter } from "../features/stats/stats.router.js";

const apiRouter = express.Router();

if (process.env.NODE_ENV !== "production") {
  apiRouter.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });
}

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/posts", postRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/comments", commentRouter);
apiRouter.use("/collections", collectionRouter);
apiRouter.use("/uploads", uploadRouter);
apiRouter.use("/stats", statsRouter);

export { apiRouter };
