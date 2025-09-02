import Database from "../database/index.js";
import { QUERIES } from "../consts/queries.js";
import type { RowDataPacket } from "mysql2/promise";

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
  private db: ReturnType<typeof Database.getPool>;
  constructor() {
    this.db = Database.getPool();
  }

  async findUserByLoginOrEmail(
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
