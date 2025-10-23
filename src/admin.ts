import AdminJS from "adminjs";
import * as AdminJSExpress from "@adminjs/express";
import Adapter, { Database, Resource } from "@adminjs/sql";

async function initializeAdminJs() {
  AdminJS.registerAdapter({
    Database,
    Resource
  });

  const db = await new Adapter("mysql2", {
    database: process.env.MYSQL_DATABASE || "usof",
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: process.env.MYSQL_PORT ? +process.env.MYSQL_PORT : 3306,
    user: process.env.MYSQL_USER || "usof",
    password: process.env.MYSQL_PASSWORD || "usofpassword",
    timezone: "Z"
  }).init();

  const admin = new AdminJS({
    databases: [db]
  });

  const AdminRouter = AdminJSExpress.buildRouter(admin);

  return AdminRouter;
}

export { initializeAdminJs };
