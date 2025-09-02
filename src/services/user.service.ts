import type { GetUsersDto } from "../dto/user.dto.js";
import type { UserModel } from "../models/user.model.js";

class UserService {
  private static instance: UserService | null = null;
  private userModel: UserModel;

  private constructor(user: typeof UserModel) {
    this.userModel = user.getInstance();
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
}

export { UserService };
