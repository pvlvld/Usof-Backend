import { EncryptionService } from "./encryption.service.js";
import type { GetUsersDto } from "../dto/user.dto.js";
import type { UserModel } from "../models/user.model.js";
import type { PasswordResetDto } from "../dto/auth.dto.js";

class UserService {
  private static instance: UserService | null = null;
  private userModel: UserModel;
  private encryptionService: EncryptionService;

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

  public getUsers(dto: GetUsersDto) {
    return this.userModel.getUsers(dto);
  }

  public updatePassword(dto: PasswordResetDto) {
    if (dto.password !== dto.passwordConfirmation) {
      throw { status: 400, message: "Passwords do not match" };
    }

    const password_salt = this.encryptionService.genSalt(10);
    const password_hash = this.encryptionService.hash(
      dto.password,
      password_salt
    );

    return this.userModel.updatePassword(1, password_hash, password_salt);
  }
}

export { UserService };
