import { QUERIES } from "../consts/queries.js";
import Database from "../database/index.js";

export class RefreshTokenModel {
  private static instance: RefreshTokenModel | null = null;
  constructor(private db: ReturnType<typeof Database.getPool>) {
    this.db = Database.getPool();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RefreshTokenModel(Database.getPool());
    }

    return this.instance;
  }

  async saveRefreshToken(user_id: number, token: string, expires_at: Date) {
    await this.db.query(QUERIES.REFRESH_TOKEN.CREATE, [
      user_id,
      token,
      expires_at
    ]);
  }

  async removeRefreshToken(token: string) {
    await this.db.query(QUERIES.REFRESH_TOKEN.DELETE, [token]);
  }

  async findRefreshToken(token: string) {
    const [rows] = await this.db.query(
      "SELECT * FROM refresh_token WHERE token = ?",
      [token]
    );

    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  }
}
