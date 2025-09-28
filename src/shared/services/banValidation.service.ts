import type { IUserModel, UserModel } from "../../features/user/user.model.js";
import { UserBannedError } from "../consts/errors.js";

export interface IBanStatus {
  readonly isBanned: boolean;
  readonly isPermanent: boolean;
  readonly expiresAt?: Date;
  readonly appliedAt?: Date;
  readonly message: string;
  readonly reason?: string | null;
}

export class BanValidationService {
  private static instance: BanValidationService | null = null;
  private userModel: UserModel;

  private constructor(userModel: typeof UserModel) {
    this.userModel = userModel.getInstance();
  }

  public static getInstance(userModel: typeof UserModel): BanValidationService {
    if (!this.instance) {
      this.instance = new BanValidationService(userModel);
    }
    return this.instance;
  }

  public async checkUserBanStatus(user: IUserModel): Promise<IBanStatus> {
    if (!user.banned_until) {
      return {
        isBanned: false,
        isPermanent: false,
        message: "User is not banned"
      };
    }

    const now = new Date();
    const banExpiry = new Date(user.banned_until);

    // Check for permanent ban (epoch time 0)
    if (banExpiry.getTime() === 0) {
      return {
        isBanned: true,
        isPermanent: true,
        reason: user.ban_reason,
        message: "User is permanently banned"
      };
    }

    if (banExpiry <= now) {
      return {
        isBanned: false,
        isPermanent: false,
        message: "Ban has expired and should be removed"
      };
    }

    return {
      isBanned: true,
      isPermanent: false,
      expiresAt: banExpiry,
      reason: user.ban_reason,
      message: `User is banned until ${banExpiry.toISOString()}`
    };
  }

  /**
   * Validates that user is not banned and handles automatic unban if needed
   * Throws UserBannedError if user is currently banned
   * Automatically removes expired bans
   */
  public async validateUserNotBanned(user: IUserModel): Promise<void> {
    const banInfo = await this.checkUserBanStatus(user);

    if (!banInfo.isBanned) {
      // If ban has expired, clean it up
      if (user.banned_until && banInfo.message.includes("expired")) {
        await this.removeExpiredBan(user);
      }
      return;
    }

    if (banInfo.isPermanent) {
      throw UserBannedError.permanent();
    } else {
      throw UserBannedError.temporary(banInfo.expiresAt!);
    }
  }

  private async removeExpiredBan(user: IUserModel): Promise<void> {
    try {
      await this.userModel.unbanUser({ user_id: user.id });
    } catch (error) {
      console.error(`Failed to remove expired ban for user ${user.id}:`, error);
    }
  }
}
