import { QUERIES } from "../consts/queries.js";
import Database from "../database/index.js";

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
    const [res] = await this.db.query(QUERIES.PASSWORD_RESETS.CREATE, [
      userId,
      token,
      expiresAt
    ]);
    return res;
  }

  public async getResetEntry(token: string) {
    const [res] = await this.db.query(QUERIES.PASSWORD_RESETS.GET_BY_TOKEN, [
      token
    ]);
    return res;
  }
}
