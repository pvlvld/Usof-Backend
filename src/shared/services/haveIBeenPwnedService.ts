import crypto from "node:crypto";

class HaveIBeenPwnedService {
  private static instance: HaveIBeenPwnedService | null = null;

  private constructor() {}

  public static getInstance() {
    if (!this.instance) {
      this.instance = new HaveIBeenPwnedService();
    }
    return this.instance;
  }

  public async checkPasswordPwned(password: string) {
    const sha1HashedPassword = this.sha1Hash(password);
    const prefix = sha1HashedPassword.slice(0, 5);
    const suffix = sha1HashedPassword.slice(5);

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        method: "GET",
        headers: {
          "Add-Padding": "true"
        }
      }
    );

    if (!response.ok) {
      throw new Error("Failed to check password pwnage");
    }

    const data = await response.text();
    const lines = data.split("\r\n");

    let hashSuffix = "";
    let count = "";
    for (const line of lines) {
      [hashSuffix, count] = <[string, string]>line.split(":");
      if (hashSuffix === suffix) {
        return parseInt(count || "0", 10);
      }
    }

    return 0;
  }

  private sha1Hash(password: string): string {
    return crypto
      .createHash("sha1")
      .update(password)
      .digest("hex")
      .toUpperCase();
  }
}

export { HaveIBeenPwnedService };
