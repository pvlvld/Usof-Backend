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

  public async saveRefreshToken(
    user_id: number,
    token: string,
    expires_at: Date
  ) {
    await this.db.query(QUERIES.REFRESH_TOKEN.CREATE, [
      user_id,
      token,
      expires_at
    ]);
  }

  public async removeRefreshToken(refreshToken: string) {
    await this.db.query(QUERIES.REFRESH_TOKEN.DELETE, [refreshToken]);
  }

  public async findRefreshToken(refreshToken: string) {
    const [rows] = await this.db.query(
      "SELECT * FROM refresh_token WHERE token = ?",
      [refreshToken]
    );

    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  }
}
