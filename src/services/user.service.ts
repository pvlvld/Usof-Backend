import { EncryptionService } from "./encryption.service.js";
import type {
  BanUserDTO,
  CreateUserDTO,
  DeleteUserDTO,
  GetUserByIdDTO,
  GetUsersDto,
  UnbanUserDTO,
  UpdateUserDataDTO
} from "../dto/user.dto.js";
import type { IUserModel, UserModel } from "../models/user.model.js";
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
    const user = await this.userModel.getUserById(dto);
    if (!user) {
      throw { status: 404, message: "User not found" };
    }
    return user;
  }

  public async getUsers(dto: GetUsersDto) {
    const offset = (dto.page - 1) * dto.limit;
    return await this.userModel.getUsers(dto.limit, offset);
  }

  public async createUser(dto: CreateUserDTO) {
    return await this.userModel.createUser(dto);
  }

  public async updateUser(dto: UpdateUserDataDTO & { user_id: number }) {
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

  public async deleteUser(dto: DeleteUserDTO) {
    const user = await this.userModel.getUserById({ user_id: dto.user_id });

    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    const result = await this.userModel.deleteUser({ user_id: dto.user_id });

    if (!result) {
      throw { status: 500, message: "Failed to delete user" };
    }

    return result;
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

  public banUser(dto: BanUserDTO) {
    return this.userModel.banUser(dto);
  }

  public unbanUser(dto: UnbanUserDTO) {
    return this.userModel.unbanUser(dto);
  }
}

export { UserService };
