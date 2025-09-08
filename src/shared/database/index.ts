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
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "usof",
      password: process.env.DB_PASSWORD || "usofpassword",
      database: process.env.DB_NAME || "usof",
      typeCast: true
    });

    return this.pool;
  }
}

export default Database;
