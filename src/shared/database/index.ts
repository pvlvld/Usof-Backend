import mysql from "mysql2/promise";
import type { Pool } from "mysql2/promise";

class Database {
  private static pool: Pool | null = null;

  private constructor() {}

  public static getPool(): Pool {
    if (this.pool) {
      return this.pool;
    }

    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "127.0.0.1",
      user: process.env.MYSQL_USER || "usof",
      password: process.env.MYSQL_PASSWORD || "usofpassword",
      database: process.env.MYSQL_DATABASE || "usof",
      port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
      typeCast: true,
      timezone: "Z"
    });

    return this.pool;
  }
}

export default Database;
