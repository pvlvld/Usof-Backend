import AdminJS from "adminjs";
import * as AdminJSExpress from "@adminjs/express";
import Adapter, { Database, Resource } from "@adminjs/sql";

async function initializeAdminJs() {
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

  const AdminRouter = AdminJSExpress.buildRouter(admin);

  return AdminRouter;
}

export { initializeAdminJs };
