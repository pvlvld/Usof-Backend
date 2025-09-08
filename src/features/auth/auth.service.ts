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

  public async register(dto: RegisterDto) {
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

    await this.refreshTokenModel.saveRefreshToken(user.id, refreshToken);

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
    refreshTokenFromClient?: string
  ) {
    let refreshToken = refreshTokenFromClient;
    let validRefreshToken = false;

    if (refreshToken) {
      try {
        const payload = this.jwtService.verifyRefreshToken(refreshToken);
        if (
          payload &&
          payload.sub &&
          String(user.sub) === String(payload.sub)
        ) {
          const storedToken = await this.refreshTokenModel.findRefreshToken(
            refreshToken
          );
          if (storedToken) {
            validRefreshToken = true;
          }
        }
      } catch (e) {
        validRefreshToken = false;
      }
    }

    if (!validRefreshToken) {
      refreshToken = this.jwtService.signRefreshToken(user);
      await this.refreshTokenModel.saveRefreshToken(+user.sub, refreshToken);
    }

    const accessToken = this.jwtService.signAccessToken(user);
    return {
      user,
      accessToken,
      refreshToken
    };
  }

  public async login(dto: LoginDto, refreshTokenFromClient?: string) {
    const user = await this.userModel.findUserByLoginOrEmail(dto.login);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const passwordValid = this.encryptionService.compare(
      dto.password,
      user.password_hash
    );
    if (!passwordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    return this.issueTokensForUser(
      { sub: String(user.id), role: user.role },
      refreshTokenFromClient
    );
  }

  public async logout(dto: LogoutDTO) {
    await this.refreshTokenModel.removeRefreshToken(dto.refreshToken);
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

  public async refreshAccessToken(refreshToken: string) {
    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    if (!payload || !payload.sub) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const storedToken = await this.refreshTokenModel.findRefreshToken(
      refreshToken
    );
    if (!storedToken) {
      throw new UnauthorizedError("Refresh token not found");
    }

    const user = await this.userModel.getUserById({
      user_id: Number(payload.sub)
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.issueTokensForUser(
      { sub: String(user.id), role: user.role },
      refreshToken
    );
  }
}

export { AuthService };
