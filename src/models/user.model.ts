import Database from "../database/index.js";
import { QUERIES } from "../consts/queries.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
  BanUserDTO,
  DeleteUserDTO,
  GetUserByIdDTO,
  UnbanUserDTO
} from "../dto/user.dto.js";
import { isErrorWithCode } from "../utils/typeGuards.js";
export type IUserRole = "user" | "admin" | "donator";

export type IUserModel = {
  id: number;
  login: string;
  password_hash: string;
  password_salt: string;
  full_name: string;
  email: string;
  is_email_verified: boolean;
  avatar: string;
  rating: number;
  role: IUserRole;

  created_at: Date;
  updated_at: Date;
  banned_until: Date | null;
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
      throw { status: 500, message: "Database error occurred" };
    }
  }

  public async getUsers(limit: number, offset: number) {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(
        QUERIES.USER.GET_PAGINATED,
        [limit, offset]
      );
      return rows;
    } catch (error) {
      console.error("Error getting users:", error);
      throw { status: 500, message: "Database error occurred" };
    }
  }

  public async updateUser(dto: Partial<IUserModel>) {
    try {
      const [res] = await this.db.query<ResultSetHeader>(QUERIES.USER.UPDATE, [
        dto.login,
        dto.email,
        dto.password_hash,
        dto.password_salt,
        dto.full_name,
        dto.avatar,
        dto.rating,
        dto.role,
        dto.id
      ]);
      if (res.affectedRows > 0) {
        return { user_id: dto.id };
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw { status: 500, message: "Database error occurred" };
    }
  }

  public async deleteUser(dto: DeleteUserDTO) {
    const [result] = await this.db.query<ResultSetHeader>(QUERIES.USER.DELETE, [
      dto.user_id
    ]);
    if (result.affectedRows > 0) {
      return { user_id: dto.user_id };
    }
    return null;
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
      console.error("Error finding user by login or email:", error);
      throw { status: 500, message: "Database error occurred" };
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
          throw {
            status: 400,
            message: "User with this login or email already exists"
          };
        }
        throw { status: 500, message: "Database error occurred" };
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
          throw {
            status: 400,
            message: "User with this login or email already exists"
          };
        }
        throw { status: 500, message: "Database error occurred" };
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
      throw { status: 500, message: "Database error occurred" };
    }
  }

  public banUser(dto: BanUserDTO) {
    try {
      return this.db.query(QUERIES.USER.BAN, [
        dto.banned_until,
        dto.ban_reason,
        dto.user_id
      ]);
    } catch (error) {
      console.error("Error banning user:", error);
      throw { status: 500, message: "Database error occurred" };
    }
  }

  public unbanUser(dto: UnbanUserDTO) {
    try {
      return this.db.query(QUERIES.USER.UNBAN, [dto.user_id]);
    } catch (error) {
      console.error("Error unbanning user:", error);
      throw { status: 500, message: "Database error occurred" };
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
      throw { status: 500, message: "Database error occurred" };
    }
  }
}

// Do I need it with DTO's?
export class User implements IUserModel {
  constructor(
    public id: number,
    public login: string,
    public password_hash: string,
    public password_salt: string,
    public full_name: string,
    public email: string,
    public is_email_verified: boolean,
    public avatar: string,
    public rating: number,
    public role: IUserRole,
    public created_at: Date,
    public updated_at: Date,
    public banned_until: Date | null
  ) {}
}
