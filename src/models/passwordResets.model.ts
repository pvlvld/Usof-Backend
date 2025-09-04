import { QUERIES } from "../consts/queries.js";
import Database from "../database/index.js";

type IResetToken = {
  userId: number;
  token: string;
  expiresAt: Date;
};

export class PasswordResetsModel {
  private static instance: PasswordResetsModel | null = null;
  private db: ReturnType<typeof Database.getPool>;

  private constructor() {
    this.db = Database.getPool();
  }

  public static getInstance(): PasswordResetsModel {
    if (!PasswordResetsModel.instance) {
      PasswordResetsModel.instance = new PasswordResetsModel();
    }
    return PasswordResetsModel.instance;
  }

  public async createResetEntry(
    userId: number,
    token: string,
    expiresAt: Date
  ) {
    if (typeof token !== "string") {
      throw new Error("Invalid token");
    }

    if (token.length !== 64) {
      throw new Error("Invalid token length");
    }

    const [res] = await this.db.query(QUERIES.PASSWORD_RESETS.CREATE, [
      userId,
      token,
      expiresAt
    ]);
    return res;
  }

  public async getResetEntry(token: string) {
    const [rows] = await this.db.query(QUERIES.PASSWORD_RESETS.GET_BY_TOKEN, [
      token
    ]);
    return (rows[0] as IResetToken) ?? null;
  }

  public async invalidateToken(token: string) {
    try {
      const entry = await this.getResetEntry(token);
      if (!entry) {
        throw new Error("Invalid or expired token");
      }

      // Probably better to use a soft delete
      await this.db.query(QUERIES.PASSWORD_RESETS.DELETE, [token]);
    } catch (error) {
      console.error("Error invalidating password reset token:", error);
      throw new Error("Failed to invalidate password reset token");
    }
  }
}
