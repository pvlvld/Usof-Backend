import { EncryptionService } from "./encryption.service.js";
import type {
  CreateUserDTO,
  GetUserByIdDTO,
  GetUsersDto
} from "../dto/user.dto.js";
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

  public async getUserById(dto: GetUserByIdDTO) {
    return await this.userModel.getUserById(dto);
  }

  public async getUsers(dto: GetUsersDto) {
    return await this.userModel.getUsers(dto);
  }

  public async createUser(dto: CreateUserDTO) {
    return await this.userModel.createUser(dto);
  }

  public async updateUser(dto: UpdateUserDataDTO) {
    const currentUserData = await this.userModel.getUserById({
      user_id: dto.user_id
    });

    if (!currentUserData) {
      throw { status: 404, message: "User not found" };
    }

    const newUserData = { ...currentUserData, ...dto };

    const newUser = await this.userModel.updateUser(
      newUserData as Partial<IUserModel>
    );

    if (!newUser) {
      throw { status: 500, message: "Failed to update user" };
    }

    return newUser;
  }

  public async updatePassword(dto: PasswordResetDto) {
    if (dto.password !== dto.passwordConfirmation) {
      throw { status: 400, message: "Passwords do not match" };
    }

    const password_salt = this.encryptionService.genSalt(10);
    const password_hash = this.encryptionService.hash(
      dto.password,
      password_salt
    );

    return await this.userModel.updatePassword(1, password_hash, password_salt);
  }
}

export { UserService };
