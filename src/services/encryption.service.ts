import bcrypt from "bcryptjs";

class EncryptionService {
  private static instance: EncryptionService | null = null;

  private constructor() {}

  public static getInstance() {
    if (!this.instance) {
      this.instance = new EncryptionService();
    }
    return this.instance;
  }

  public genSalt(rounds = 10) {
    return bcrypt.genSaltSync(rounds);
  }

  public hash(password: string, salt: string) {
    return bcrypt.hashSync(password, salt);
  }

  public compare(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
  }
}

export { EncryptionService };
