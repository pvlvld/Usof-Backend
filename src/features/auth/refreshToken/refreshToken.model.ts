import type { RowDataPacket } from "mysql2";
import { QUERIES } from "../../../shared/consts/queries.js";
import Database from "../../../shared/database/index.js";

export type IRefreshTokenData = {
  user_id: number;
  token: string;
  ip: string;
  user_agent: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
};

export class RefreshTokenModel {
  private static instance: RefreshTokenModel | null = null;
  private constructor(private db: ReturnType<typeof Database.getPool>) {
    this.db = Database.getPool();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RefreshTokenModel(Database.getPool());
    }

    return this.instance;
  }

  public async createRefreshToken(
    user_id: number,
    token: string,
    ip: string,
    user_agent: string,
    expires_at: Date
  ) {
    await this.db.query(QUERIES.REFRESH_TOKEN.CREATE, [
      user_id,
      token,
      ip,
      user_agent,
      expires_at
    ]);
  }

  public async removeRefreshToken(refreshToken: string) {
    await this.db.query(QUERIES.REFRESH_TOKEN.DELETE, [refreshToken]);
  }

  public async removeAllTokensForUser(user_id: number) {
    await this.db.query(QUERIES.REFRESH_TOKEN.DELETE_BY_USER_ID, [user_id]);
  }

  public async findRefreshToken(refreshToken: string) {
    const [rows] = await this.db.query<(RowDataPacket & IRefreshTokenData)[]>(
      "SELECT * FROM refresh_token WHERE token = ?",
      [refreshToken]
    );

    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  }
}
