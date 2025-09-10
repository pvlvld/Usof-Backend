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
import type { IUserModel, UserModel } from "./user.model.js";
import path from "node:path";
import fs from "node:fs";

class UserService {
  private static instance: UserService | null = null;
  private userModel: UserModel;
  private encryptionService: EncryptionService;
  private avatarDir = path.join(process.cwd(), "public", "uploads", "avatars");
  private defaultAvatarPath = path.join(this.avatarDir, "default_avatar.webp");

  private constructor(user: typeof UserModel) {
    this.userModel = user.getInstance();
    this.encryptionService = EncryptionService.getInstance();
  }

  public static getInstance(user: typeof UserModel) {
    if (!this.instance) {
      this.instance = new UserService(user);
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
    return await this.userModel.getUsers(dto.limit, offset);
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

    const newUserData = { ...currentUserData, ...dto };

    const newUser = await this.userModel.updateUser(
      newUserData as Partial<IUserModel>
    );

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

  public async updatePassword(dto: PasswordResetDto) {
    if (dto.password !== dto.passwordConfirmation) {
      throw new BadRequestError("Passwords do not match");
    }

    const password_salt = this.encryptionService.genSalt(10);
    const password_hash = this.encryptionService.hash(
      dto.password,
      password_salt
    );

    return await this.userModel.updatePassword(1, password_hash, password_salt);
  }

  public banUser(dto: BanUserDTO) {
    return this.userModel.banUser(dto);
  }

  public unbanUser(dto: UnbanUserDTO) {
    return this.userModel.unbanUser(dto);
  }

  public findUserByLoginOrEmail(loginOrEmail: string) {
    return this.userModel.findUserByLoginOrEmail(loginOrEmail);
  }

  public async getAvatarPath(userId: number): Promise<string | null> {
    const filename = `avatar_${userId}.webp`;
    const filePath = path.join(this.avatarDir, filename);
    try {
      await fs.promises.access(filePath);
      return filePath;
    } catch (error) {
      // Check user existence only if avatar file is missing
      // to avoid unnecessary DB calls and potential performance hit
      const isUserExists = await this.userModel.getUserById({
        user_id: userId
      });
      if (!isUserExists) {
        throw new NotFoundError("User not found");
      }
      return this.defaultAvatarPath;
    }
  }
}

export { UserService };
