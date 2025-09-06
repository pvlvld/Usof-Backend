import type {
  EmailVerificationDto,
  LoginDto,
  LogoutDTO,
  RegisterDto
} from "../dto/auth.dto.js";
import { EmailVerificationModel } from "../models/emailVerifications.model.js";
import type { RefreshTokenModel } from "../models/refreshToken.model.js";
import type { UserModel } from "../models/user.model.js";
import { EncryptionService } from "./encryption.service.js";
import { JwtService } from "./jwt.service.js";

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
      throw { status: 500, message: "Failed to create user" };
    }

    const accessToken = this.jwtService.signAccessToken({
      sub: String(user.id),
      role: user.role
    });
    const refreshToken = this.jwtService.signRefreshToken({
      sub: String(user.id)
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

    const passwordValid = this.encryptionService.compare(
      dto.password,
      user.password_hash
    );
    if (!passwordValid) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const accessToken = this.jwtService.signAccessToken({
      sub: String(user.id),
      role: user.role
    });
    const refreshToken = this.jwtService.signRefreshToken({
      sub: String(user.id)
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

  public async verifyEmail(dto: EmailVerificationDto) {
    const emailVerification = await this.emailVerificationModel.getByToken(
      dto.confirm_token
    );

    if (!emailVerification) {
      throw { status: 400, message: "Invalid token" };
    }

    const res = await this.userModel.verifyEmail(emailVerification.user_id);
    await this.emailVerificationModel.deleteByToken(dto.confirm_token);
    if (res.affectedRows === 0) {
      throw { status: 500, message: "Failed to verify email" };
    }
  }
}

export { AuthService };
