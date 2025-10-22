import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import Database from "../../shared/database/index.js";
import type {
  BanUserDTO,
  DeleteUserDTO,
  GetUserByIdDTO,
  GetUsersDto,
  IUserRole,
  UnbanUserDTO,
  UpdateUserDataDTO
} from "./user.dto.js";
import { QUERIES } from "../../shared/consts/queries.js";
import {
  BadRequestError,
  InternalServerError
} from "../../shared/consts/errors.js";
import { isErrorWithCode } from "../../shared/utils/typeGuards.js";

export type IUserModel = {
  id: number;
  login: string;
  password_hash: string;
  password_salt: string;
  full_name: string;
  email: string;
  email_verified: boolean;
  avatar: string;
  rating: number;
  role: IUserRole;

  created_at: Date;
  updated_at: Date;
  banned_until: Date | null;
  ban_reason: string | null;
  deleted_at: Date | null;
  last_online: Date | null;
};

type IRegisterUser = {
  login: string;
  password_hash: string;
  password_salt: string;
  email: string;
};

type ICreateUser = IRegisterUser & {
  role: IUserRole;
};

export class UserModel {
  private static instance: UserModel | null = null;
  private db: ReturnType<typeof Database.getPool>;
  private constructor() {
    this.db = Database.getPool();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new UserModel();
    }
    return this.instance;
  }

  public async getUserById(dto: GetUserByIdDTO) {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(
        QUERIES.USER.GET_BY_ID,
        [dto.user_id]
      );

      return Array.isArray(rows) && rows.length > 0 && rows[0]
        ? (rows[0] as IUserModel)
        : null;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw new InternalServerError("Database error occurred");
    }
  }

  public async getUsers(
    sort: GetUsersDto["sort"],
    order: GetUsersDto["order"],
    limit: GetUsersDto["limit"],
    offset: number
  ) {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(
        QUERIES.USER.GET_PAGINATED(sort, order, limit, offset)
      );
      return rows;
    } catch (error) {
      console.error("Error getting users:", error);
      throw new InternalServerError("Database error occurred");
    }
  }

  public async updateUser(user: IUserModel) {
    try {
      if (!user.id) {
        throw new BadRequestError("User ID is required for update");
      }

      const [res] = await this.db.query<ResultSetHeader>(QUERIES.USER.UPDATE, [
        user.login,
        user.password_hash,
        user.password_salt,
        user.full_name,
        user.email,
        user.email_verified,
        user.avatar,
        user.rating,
        user.role,
        user.created_at,
        user.updated_at,
        user.banned_until,
        user.ban_reason,
        user.deleted_at,
        user.id
      ]);
      if (res.affectedRows > 0) {
        return { user_id: user.id };
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw new InternalServerError("Database error occurred");
    }
  }

  public async deleteUser(dto: DeleteUserDTO) {
    const [result] = await this.db.query<ResultSetHeader>(QUERIES.USER.DELETE, [
      dto.user_id
    ]);
    return result;
  }

  public async findUserByLoginOrEmail(
    loginOrEmail: string
  ): Promise<IUserModel | null> {
    let rows: RowDataPacket[] = [];
    try {
      if (loginOrEmail.includes("@")) {
        [rows] = await this.db.query<RowDataPacket[]>(
          QUERIES.USER.FIND_BY_EMAIL,
          [loginOrEmail]
        );
      } else {
        [rows] = await this.db.query<RowDataPacket[]>(
          QUERIES.USER.FIND_BY_LOGIN,
          [loginOrEmail]
        );
      }

      if (Array.isArray(rows) && rows.length) {
        return rows[0] as IUserModel;
      }
    } catch (error) {
      throw new InternalServerError("Database error occurred");
    }

    return null;
  }

  public async registerUser({
    login,
    password_hash,
    password_salt,
    email
  }: IRegisterUser) {
    try {
      const [result] = await this.db.query<ResultSetHeader>(
        QUERIES.USER.REGISTER,
        [login, password_hash, password_salt, email]
      );
      if (result.affectedRows > 0) {
        return { user_id: result.insertId };
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error.code === "ER_DUP_ENTRY") {
          throw new BadRequestError(
            "User with this login or email already exists"
          );
        }
        throw new InternalServerError("Database error occurred");
      }
      console.error("Error creating user:", error);
    }
  }

  public async createUser({
    login,
    password_hash,
    password_salt,
    email,
    role
  }: ICreateUser) {
    try {
      const [result] = await this.db.query<ResultSetHeader>(
        QUERIES.USER.CREATE,
        [login, password_hash, password_salt, email, role]
      );
      if (result.affectedRows > 0) {
        return { user_id: result.insertId };
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error.code === "ER_DUP_ENTRY") {
          throw new BadRequestError(
            "User with this login or email already exists"
          );
        }
        throw new InternalServerError("Database error occurred");
      }
      console.error("Error creating user:", error);
    }
  }

  public async updatePassword(
    id: number,
    password_hash: string,
    password_salt: string
  ) {
    try {
      const [result] = await this.db.query<ResultSetHeader>(
        QUERIES.USER.RESET_PASSWORD,
        [password_hash, password_salt, id]
      );
      return result;
    } catch (error) {
      console.error("Error updating password:", error);
      throw new InternalServerError("Database error occurred");
    }
  }

  public banUser(dto: BanUserDTO) {
    try {
      return this.db.query<ResultSetHeader>(QUERIES.USER.BAN, [
        dto.banned_until,
        dto.ban_reason,
        dto.user_id
      ]);
    } catch (error) {
      console.error("Error banning user:", error);
      throw new InternalServerError("Database error occurred");
    }
  }

  public unbanUser(dto: UnbanUserDTO) {
    try {
      return this.db.query<ResultSetHeader>(QUERIES.USER.UNBAN, [dto.user_id]);
    } catch (error) {
      console.error("Error unbanning user:", error);
      throw new InternalServerError("Database error occurred");
    }
  }

  public async verifyEmail(userId: number) {
    try {
      const [res] = await this.db.query<ResultSetHeader>(
        QUERIES.USER.VERIFY_EMAIL,
        [userId]
      );
      return res;
    } catch (error) {
      console.error("Error verifying email:", error);
      throw new InternalServerError("Database error occurred");
    }
  }
}
