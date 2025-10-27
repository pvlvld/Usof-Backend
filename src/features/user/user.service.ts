import { EncryptionService } from "../../shared/services/encryption.service.js";
import type {
  BanUserDTO,
  CreateUserDTO,
  DeleteUserDTO,
  GetUserByIdDTO,
  GetUsersDto,
  UnbanUserDTO,
  UpdateUserDataDTO
} from "./user.dto.js";
import type { PasswordResetDto } from "../auth/auth.dto.js";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError
} from "../../shared/consts/errors.js";
import { UserModel, type IUserModel } from "./user.model.js";
import type { AuthService } from "../auth/auth.service.js";
import path from "node:path";
import fs from "node:fs";
import { RefreshTokenModel } from "../auth/refreshToken/refreshToken.model.js";
import { EmailVerificationModel } from "../auth/emailVerification/emailVerifications.model.js";

class UserService {
  private static instance: UserService | null = null;
  private userModel: UserModel;
  private encryptionService: EncryptionService;
  private authService: AuthService;
  private avatarDir = path.join(process.cwd(), "public", "uploads", "avatars");
  private defaultAvatarPath = path.join(this.avatarDir, "default_avatar.webp");
  private defaultAvatarBuffer: Buffer | null = null;

  private constructor(user: typeof UserModel, authService: typeof AuthService) {
    this.userModel = user.getInstance();
    this.encryptionService = EncryptionService.getInstance();
    this.authService = authService.getInstance(
      RefreshTokenModel,
      UserModel,
      EmailVerificationModel
    );
  }

  public static getInstance(
    user: typeof UserModel,
    authService: typeof AuthService,
    options?: { defaultAvatarPath: string }
  ) {
    if (!this.instance) {
      this.instance = new UserService(user, authService);
      if (options?.defaultAvatarPath) {
        this.instance.defaultAvatarPath = options.defaultAvatarPath;
      }
      this.instance.defaultAvatarBuffer = fs.readFileSync(
        this.instance.defaultAvatarPath
      );
    }
    return this.instance;
  }

  public async getUserById(dto: GetUserByIdDTO) {
    const user = await this.userModel.getUserById(dto);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  public async getUsers(dto: GetUsersDto) {
    const offset = (dto.page - 1) * dto.limit;
    return await this.userModel.getUsers(
      dto.sort,
      dto.order,
      dto.limit,
      offset
    );
  }

  public async createUser(dto: CreateUserDTO) {
    const password_salt = this.encryptionService.genSalt(10);
    const password_hash = this.encryptionService.hash(
      dto.password,
      password_salt
    );
    return await this.userModel.createUser({
      login: dto.login,
      password_hash,
      password_salt,
      email: dto.email,
      role: dto.role
    });
  }

  public async updateUser(dto: UpdateUserDataDTO & { user_id: number }) {
    const currentUserData = await this.userModel.getUserById({
      user_id: dto.user_id
    });

    if (!currentUserData) {
      throw new NotFoundError("User not found");
    }

    // Only overwrite fields from dto if they are not undefined
    const newUserData = { ...currentUserData };
    for (const key of Object.keys(dto)) {
      const value = (dto as any)[key];
      if (value !== undefined) {
        (newUserData as any)[key] = value;
      }
    }
    const newUser = await this.userModel.updateUser(newUserData);

    if (!newUser) {
      throw new InternalServerError("Failed to update user");
    }

    return newUser;
  }

  public async deleteUser(dto: DeleteUserDTO) {
    const user = await this.userModel.getUserById({ user_id: dto.user_id });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const result = await this.userModel.deleteUser({ user_id: dto.user_id });

    if (!result) {
      throw new InternalServerError("Failed to delete user");
    }

    return result;
  }

  public async updatePassword(dto: PasswordResetDto & { userId: number }) {
    const password_salt = this.encryptionService.genSalt(10);
    const password_hash = this.encryptionService.hash(
      dto.password,
      password_salt
    );

    return await this.userModel.updatePassword(
      dto.userId,
      password_hash,
      password_salt
    );
  }

  public banUser(dto: BanUserDTO) {
    this.authService.logoutAllSessions(dto.user_id);
    return this.userModel.banUser(dto);
  }

  public unbanUser(dto: UnbanUserDTO) {
    return this.userModel.unbanUser(dto);
  }

  public findUserByLoginOrEmail(loginOrEmail: string) {
    return this.userModel.findUserByLoginOrEmail(loginOrEmail);
  }

  public async getUserAvatar(userId: number): Promise<Buffer> {
    const avatarPath = await this.getAvatarPath(userId);
    if (!avatarPath) {
      throw new NotFoundError("User avatar not found");
    }

    if (avatarPath === this.defaultAvatarPath && this.defaultAvatarBuffer) {
      return this.defaultAvatarBuffer;
    }

    return await fs.promises.readFile(avatarPath);
  }

  private async getAvatarPath(userId: number): Promise<string | null> {
    const filename = `avatar_${userId}.webp`;
    const filePath = path.join(this.avatarDir, filename);
    try {
      await fs.promises.access(filePath);
      return filePath;
    } catch (error) {
      // Check user existence only if avatar file is missing
      // to avoid unnecessary DB calls and potential performance hit
      // TODO: optimize
      // const isUserExists = await this.userModel.getUserById({
      //   user_id: userId
      // });
      // if (!isUserExists) {
      //   throw new NotFoundError("User not found");
      // }
      return this.defaultAvatarPath;
    }
  }
}

export { UserService };
