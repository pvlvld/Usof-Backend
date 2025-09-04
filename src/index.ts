import "reflect-metadata";
import AdminJS from "adminjs";
import Plugin from "@adminjs/express";
import Adapter, { Database, Resource } from "@adminjs/sql";
import express, { type Request, type Response } from "express";
import { apiRouter } from "./routers/api.router.js";
import cookieParser from "cookie-parser";

async function startAdminJS(app: express.Express) {
  AdminJS.registerAdapter({
    Database,
    Resource
  });

  const db = await new Adapter("mysql2", {
    database: process.env.DB_NAME || "usof",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? +process.env.DB_PORT : 3306,
    user: process.env.DB_USER || "usof",
    password: process.env.DB_PASSWORD || "usofpassword"
  }).init();

  const admin = new AdminJS({
    databases: [db]
  });

  admin.watch(); // Development mode

  const router = Plugin.buildRouter(admin);

  return router;
}

async function start() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  const adminRouter = await startAdminJS(app);
  app.use("/admin", adminRouter);

  app.get("/", (req: Request, res: Response) => {
    res.redirect("/api");
  });

  app.use("/api", apiRouter);

  app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });
}

start();
