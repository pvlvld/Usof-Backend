import { PasswordResetsModel } from "../models/passwordResets.model.js";
import crypto from "node:crypto";
import type { UserModel } from "../models/user.model.js";

class PasswordResetsService {
  private static instance: PasswordResetsService | null = null;
  private passwordResetsModel: PasswordResetsModel;
  private userModel: UserModel;

  private constructor(
    passwordReset: typeof PasswordResetsModel,
    userModel: typeof UserModel
  ) {
    this.passwordResetsModel = passwordReset.getInstance();
    this.userModel = userModel.getInstance();
  }

  public static getInstance(
    passwordResetsModel: typeof PasswordResetsModel,
    userModel: typeof UserModel
  ) {
    if (!this.instance) {
      this.instance = new PasswordResetsService(passwordResetsModel, userModel);
    }
    return this.instance;
  }

  public async getPasswordResetToken(email: string) {
    const user = await this.userModel.findUserByLoginOrEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    // 1 hour
    const expiresAt = new Date(Date.now() + 3600000);
    const token = crypto.randomBytes(32).toString("hex");

    try {
      await this.passwordResetsModel.createResetEntry(
        user.id,
        token,
        expiresAt
      );
    } catch (error) {
      console.error("Error creating password reset entry:", error);
      throw new Error("Failed to create password reset token");
    }

    return token;
  }

  public async validateToken(token: string) {
    try {
      const entry = await this.passwordResetsModel.getResetEntry(token);
      if (!entry) {
        throw new Error("Invalid or expired token");
      }

      return entry;
    } catch (error) {
      console.error("Error validating password reset token:", error);
      throw new Error("Failed to validate password reset token");
    }
  }

  public async invalidateToken(token: string) {
    try {
      const entry = await this.passwordResetsModel.getResetEntry(token);
      if (!entry) {
        throw new Error("Invalid or expired token");
      }

      await this.passwordResetsModel.invalidateToken(token);
    } catch (error) {
      console.error("Error invalidating password reset token:", error);
      throw new Error("Failed to invalidate password reset token");
    }
  }
}

export { PasswordResetsService };
