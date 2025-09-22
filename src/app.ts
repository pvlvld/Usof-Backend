import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { apiRouter } from "./api/api.router.js";
import { initializeAdminJs } from "./admin.js";
import {
  authenticateMiddleware,
  requireAdminMiddleware
} from "./shared/middlewares/auth.middleware.js";
import { errorHandler } from "./shared/middlewares/errorHandler.middleware.js";

export async function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
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

  return app;
}
