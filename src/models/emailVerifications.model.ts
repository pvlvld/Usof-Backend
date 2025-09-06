import { QUERIES } from "../consts/queries.js";
import Database from "../database/index.js";

type IEmailVerification = {
  user_id: number;
  token: string;
};

class EmailVerificationModel {
  private static instance: EmailVerificationModel | null = null;
  private db: ReturnType<typeof Database.getPool>;
  private constructor() {
    this.db = Database.getPool();
  }

  public static getInstance(): EmailVerificationModel {
    if (!EmailVerificationModel.instance) {
      EmailVerificationModel.instance = new EmailVerificationModel();
    }
    return EmailVerificationModel.instance;
  }

  async create(emailVerification: IEmailVerification): Promise<void> {
    await this.db.query(QUERIES.EMAIL_VERIFICATIONS.CREATE, [
      emailVerification.user_id,
      emailVerification.token
    ]);
  }

  async getByToken(token: string): Promise<IEmailVerification | null> {
    const result = await this.db.query(
      QUERIES.EMAIL_VERIFICATIONS.GET_BY_TOKEN,
      [token]
    );
    return (result[0]?.[0] as IEmailVerification) || null;
  }

  async getByUserId(user_id: number): Promise<IEmailVerification | null> {
    const result = await this.db.query(
      QUERIES.EMAIL_VERIFICATIONS.GET_BY_USER_ID,
      [user_id]
    );
    return (result[0]?.[0] as IEmailVerification) || null;
  }

  async deleteByToken(token: string): Promise<void> {
    await this.db.query(QUERIES.EMAIL_VERIFICATIONS.DELETE, [token]);
  }
}

export { EmailVerificationModel };
