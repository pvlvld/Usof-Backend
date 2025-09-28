import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError
} from "../../shared/consts/errors.js";
import type {
  EmailVerificationDto,
  LoginDto,
  LogoutDTO,
  RegisterDto
} from "./auth.dto.js";
import { EmailVerificationModel } from "./emailVerification/emailVerifications.model.js";
import type { RefreshTokenModel } from "./refreshToken/refreshToken.model.js";
import { EncryptionService } from "../../shared/services/encryption.service.js";
import {
  JwtService,
  type IJwtPayloadAuth
} from "../../shared/services/jwt.service.js";
import type { UserModel } from "../user/user.model.js";

export type IUserLoginInfo = {
  ip: string;
  user_agent: string;
};

export type IRefreshTokenData = {
  user_id: number;
  token: string;
  expires_at: Date;
  created_at?: Date;
  updated_at: Date;
} & IUserLoginInfo;

class AuthService {
  private static instance: AuthService | null = null;
  private refreshTokenModel: RefreshTokenModel;
  private userModel: UserModel;
  private jwtService: JwtService;
  private encryptionService: EncryptionService;
  private emailVerificationModel: EmailVerificationModel;

  private constructor(
    auth: typeof RefreshTokenModel,
    user: typeof UserModel,
    emailVerification: typeof EmailVerificationModel
  ) {
    this.refreshTokenModel = auth.getInstance();
    this.userModel = user.getInstance();
    this.jwtService = JwtService.getInstance();
    this.encryptionService = EncryptionService.getInstance();
    this.emailVerificationModel = emailVerification.getInstance();
  }

  public static getInstance(
    auth: typeof RefreshTokenModel,
    user: typeof UserModel,
    emailVerification: typeof EmailVerificationModel
  ) {
    if (!this.instance) {
      this.instance = new AuthService(auth, user, emailVerification);
    }
    return this.instance;
  }

  public async register(dto: RegisterDto, userLoginInfo: IUserLoginInfo) {
    if (dto.login && !/^[A-Za-z](?:[A-Za-z0-9_]*[A-Za-z])?$/.test(dto.login)) {
      throw new BadRequestError("Invalid login format");
    }

    if (
      (dto.login && (await this.userModel.findUserByLoginOrEmail(dto.login))) ||
      (dto.email && (await this.userModel.findUserByLoginOrEmail(dto.email)))
    ) {
      throw new ConflictError("User with this login or email already exists");
    }

    const password_salt = this.encryptionService.genSalt(10);
    const password_hash = this.encryptionService.hash(
      dto.password,
      password_salt
    );
    await this.userModel.registerUser({
      login: dto.login,
      password_hash,
      password_salt,
      email: dto.email
    });

    const user = await this.userModel.findUserByLoginOrEmail(dto.login);
    if (!user) {
      throw new InternalServerError("Failed to create user");
    }

    const accessToken = this.jwtService.signAccessToken({
      sub: String(user.id),
      role: user.role
    });
    const refreshToken = this.jwtService.signRefreshToken({
      sub: String(user.id)
    });

    // Fill refreshTokenData with actual user_id and token
    await this.refreshTokenModel.createRefreshToken(
      user.id,
      refreshToken,
      userLoginInfo.ip,
      userLoginInfo.user_agent,
      new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30) // 30 days
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

  private async issueTokensForUser(
    user: IJwtPayloadAuth,
    userLoginInfo: IUserLoginInfo,
    refreshTokenFromClient?: string
  ) {
    let refreshToken = refreshTokenFromClient;

    if (refreshToken) {
      const payload = this.jwtService.verifyRefreshToken(refreshToken);
      if (payload && payload.sub && String(user.sub) === String(payload.sub)) {
        const storedToken =
          await this.refreshTokenModel.findRefreshToken(refreshToken);
        if (!storedToken) {
          throw new UnauthorizedError("Refresh token not found");
        }

        if (storedToken.expires_at < new Date()) {
          await this.refreshTokenModel.removeRefreshToken(refreshToken);
          throw new UnauthorizedError("Refresh token expired");
        }
      }
    }

    if (!refreshTokenFromClient) {
      refreshToken = this.jwtService.signRefreshToken(user);
      await this.refreshTokenModel.createRefreshToken(
        +user.sub,
        refreshToken,
        userLoginInfo.ip,
        userLoginInfo.user_agent,
        new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30) // 30 days
      );
    }

    const accessToken = this.jwtService.signAccessToken(user);
    return {
      user,
      accessToken,
      refreshToken
    };
  }

  public async login(dto: LoginDto, userLoginInfo: IUserLoginInfo) {
    const user = await this.userModel.findUserByLoginOrEmail(dto.login);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isPasswordValid = this.encryptionService.compare(
      dto.password,
      user.password_hash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    return this.issueTokensForUser(
      { sub: String(user.id), role: user.role },
      userLoginInfo
    );
  }

  public async logout(dto: LogoutDTO) {
    await this.refreshTokenModel.removeRefreshToken(dto.refreshToken);
  }

  public async logoutAllSessions(user_id: number) {
    try {
      await this.refreshTokenModel.removeAllTokensForUser(user_id);
    } catch (error) {
      console.error("Error removing all refresh tokens for user:", error);
      throw new InternalServerError("Database error occurred");
    }
  }

  public async verifyEmail(dto: EmailVerificationDto) {
    const emailVerification = await this.emailVerificationModel.getByToken(
      dto.confirm_token
    );

    if (!emailVerification) {
      throw new BadRequestError("Invalid token");
    }

    const res = await this.userModel.verifyEmail(emailVerification.user_id);
    await this.emailVerificationModel.deleteByToken(dto.confirm_token);
    if (res.affectedRows === 0) {
      throw new InternalServerError("Failed to verify email");
    }
  }

  public async refreshAccessToken(
    refreshToken: string,
    userLoginInfo: IUserLoginInfo
  ) {
    // TODO: refactor to avoid code duplication with issueTokensForUser
    let payload: IJwtPayloadAuth | null = null;
    try {
      payload = this.jwtService.verifyRefreshToken(
        refreshToken
      ) as IJwtPayloadAuth | null;
    } catch (e) {}

    if (!payload || !payload.sub) {
      throw new UnauthorizedError("Invalid refresh token");
    }
    const user = await this.userModel.getUserById({
      user_id: Number(payload.sub)
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.issueTokensForUser(
      { sub: String(user.id), role: user.role },
      userLoginInfo,
      refreshToken
    );
  }
}

export { AuthService };
