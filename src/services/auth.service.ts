import type { LoginDto, LogoutDTO, RegisterDto } from "../dto/auth.dto.js";
import type { RefreshTokenModel } from "../models/refreshToken.model.js";
import type { UserModel } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

class AuthService {
  private static instance: AuthService | null = null;
  private refreshTokenModel: RefreshTokenModel;
  private userModel: UserModel;

  private constructor(auth: typeof RefreshTokenModel, user: typeof UserModel) {
    this.refreshTokenModel = auth.getInstance();
    this.userModel = user.getInstance();
  }

  public static getInstance(
    auth: typeof RefreshTokenModel,
    user: typeof UserModel
  ) {
    if (!this.instance) {
      this.instance = new AuthService(auth, user);
    }
    return this.instance;
  }

  public async register(dto: RegisterDto) {
    if (dto.login && !/^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z])?$/.test(dto.login)) {
      throw { status: 400, message: "Invalid login format" };
    }

    if (
      (dto.login && (await this.userModel.findUserByLoginOrEmail(dto.login))) ||
      (dto.email && (await this.userModel.findUserByLoginOrEmail(dto.email)))
    ) {
      throw {
        status: 409,
        message: "User with this login or email already exists"
      };
    }

    const password_salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(dto.password, password_salt);
    await this.userModel.registerUser({
      login: dto.login,
      password_hash,
      password_salt,
      email: dto.email
    });

    const user = await this.userModel.findUserByLoginOrEmail(dto.login);
    if (!user) {
      throw { status: 500, message: "Failed to create user" };
    }

    // TODO: Config module
    const JWT_SECRET = process.env.JWT_SECRET || "json_secret";
    const JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET || "json_refresh_secret";
    const JWT_EXPIRES_IN = "15m";
    const JWT_REFRESH_EXPIRES_IN = "7d";

    const accessToken = jwt.sign(
      { sub: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    const refreshToken = jwt.sign({ sub: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN
    });

    await this.refreshTokenModel.saveRefreshToken(
      user.id,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
    return {
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  public async login(dto: LoginDto) {
    const loginOrEmail = dto.login ? dto.login : dto.email ? dto.email : "";
    if (!loginOrEmail) {
      throw { status: 400, message: "Login or email is required" };
    }

    const user = await this.userModel.findUserByLoginOrEmail(loginOrEmail);
    if (!user) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const passwordValid = bcrypt.compareSync(dto.password, user.password_hash);
    if (!passwordValid) {
      throw { status: 401, message: "Invalid credentials" };
    }

    // TODO: Config module
    const JWT_SECRET = process.env.JWT_SECRET || "json_secret";
    const JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET || "json_refresh_secret";
    const JWT_EXPIRES_IN = "15m";
    const JWT_REFRESH_EXPIRES_IN = "7d";

    const accessToken = jwt.sign(
      { sub: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    const refreshToken = jwt.sign({ sub: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN
    });

    await this.refreshTokenModel.saveRefreshToken(
      user.id,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    return {
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  public async logout(dto: LogoutDTO) {
    await this.refreshTokenModel.removeRefreshToken(dto.refreshToken);
  }
}

export { AuthService };
