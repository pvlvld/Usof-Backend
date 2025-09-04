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
}
