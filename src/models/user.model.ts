export type IUserRole = "user" | "admin";

export type IUserModel = {
  id: number;
  login: string;
  password: string;
  full_name: string;
  email: string;
  avatar: string;
  rating: number;
  role: IUserRole;
};

export class UserModel implements IUserModel {
  constructor(
    public id: number,
    public login: string,
    public password: string,
    public full_name: string,
    public email: string,
    public avatar: string,
    public rating: number,
    public role: IUserRole
  ) {}
}
