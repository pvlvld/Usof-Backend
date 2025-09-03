import Database from "../database/index.js";
import { QUERIES } from "../consts/queries.js";
import type { RowDataPacket } from "mysql2/promise";
import type { GetUserByIdDTO, GetUsersDto } from "../dto/user.dto.js";

export type IUserRole = "user" | "admin";

export type IUserModel = {
  id: number;
  login: string;
  password_hash: string;
  password_salt: string;
  full_name: string;
  email: string;
  avatar: string;
  rating: number;
  role: IUserRole;

  created_at: Date;
  updated_at: Date;
  banned_until: Date | null;
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
    const [rows] = await this.db.query<RowDataPacket[]>(
      QUERIES.USER.GET_USER_BY_ID,
      [dto.user_id]
    );

    return Array.isArray(rows) && rows.length > 0 && rows[0]
      ? (rows[0] as IUserModel)
      : null;
  }

  public async getUsers(dto: GetUsersDto) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      QUERIES.USER.GET_USERS,
      [dto.limit, dto.page, dto.limit]
    );
    return rows;
  }

  public async updateUser(dto: IUserModel) {
    const [rows] = await this.db.query(QUERIES.USER.UPDATE_USER, [
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

    if (Array.isArray(rows) && rows.length) {
      return rows[0] as IUserModel;
    }

    return null;
  }

  public async findUserByLoginOrEmail(
    loginOrEmail: string
  ): Promise<IUserModel | null> {
    let rows: RowDataPacket[] = [];
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

    return null;
  }

  public async registerUser({
    login,
    password_hash,
    password_salt,
    email
  }: any) {
    const [result] = await this.db.query(QUERIES.USER.REGISTER, [
      login,
      password_hash,
      password_salt,
      email
    ]);
    return result;
  }

  public async createUser({
    login,
    password_hash,
    password_salt,
    email,
    role
  }: any) {
    const [result] = await this.db.query(QUERIES.USER.CREATE, [
      login,
      password_hash,
      password_salt,
      email,
      role
    ]);
    return result;
  }

  public async updatePassword(
    id: number,
    password_hash: string,
    password_salt: string
  ) {
    const [result] = await this.db.query(QUERIES.USER.RESET_PASSWORD, [
      password_hash,
      password_salt,
      id
    ]);
    return result;
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
    public avatar: string,
    public rating: number,
    public role: IUserRole,
    public created_at: Date,
    public updated_at: Date,
    public banned_until: Date | null
  ) {}
}
