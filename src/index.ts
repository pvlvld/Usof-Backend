import "reflect-metadata";
import express, { type Request, type Response } from "express";
import { apiRouter } from "./api/api.router.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./shared/middlewares/errorHandler.middleware.js";
import { initializeAdminJs } from "./admin.js";
import {
  authenticateMiddleware,
  requireAdminMiddleware
} from "./shared/middlewares/auth.middleware.js";

async function start() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  const adminRouter = await initializeAdminJs();
  app.use(
    "/admin",
    authenticateMiddleware,
    requireAdminMiddleware,
    adminRouter
  );

  app.get("/", (req: Request, res: Response) => {
    res.redirect("/api");
  });

  app.use("/api", apiRouter);

  app.use(errorHandler);

  const PORT = process.env.PORT ? +process.env.PORT : 3000;
  app.listen(PORT, () => {
    console.log(
      `Server is running on http://localhost:${PORT} in ${
        process.env.NODE_ENV ?? "development"
      } mode`
    );
  });
}

start();
