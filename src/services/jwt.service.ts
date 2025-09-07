import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

import type { JwtPayload as JwtPayloadBase } from "jsonwebtoken";
import type { IUserRole } from "../dto/user.dto.js";

type IJwtPayload = JwtPayloadBase & {
  sub: string;
};

type IJwtPayloadAuth = IJwtPayload & {
  role: IUserRole;
};
class JwtService {
  private static instance: JwtService | null = null;
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: StringValue;
  private readonly refreshExpiresIn: StringValue;

  // Just in case
  private algorithm: jwt.Algorithm = "HS256";
  private verifyOptions: jwt.VerifyOptions = {
    algorithms: [this.algorithm]
  };

  private constructor() {
    // TODO: Config service
    this.accessSecret = process.env.JWT_SECRET || "json_secret";
    this.refreshSecret =
      process.env.JWT_REFRESH_SECRET || "json_refresh_secret";
    this.accessExpiresIn = "15m";
    this.refreshExpiresIn = "7d";
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new JwtService();
    }
    return this.instance;
  }

  public signAccessToken(payload: IJwtPayloadAuth) {
    const options: jwt.SignOptions = {
      expiresIn: this.accessExpiresIn,
      algorithm: this.algorithm
    };
    return jwt.sign(payload, this.accessSecret as jwt.Secret, options);
  }

  public signRefreshToken(payload: IJwtPayload) {
    const options: jwt.SignOptions = {
      expiresIn: this.refreshExpiresIn,
      algorithm: this.algorithm
    };
    return jwt.sign(payload, this.refreshSecret as jwt.Secret, options);
  }

  public verifyAccessToken(token: string) {
    return jwt.verify(
      token,
      this.accessSecret,
      this.verifyOptions
    ) as IJwtPayloadAuth;
  }

  public verifyRefreshToken(token: string) {
    return jwt.verify(
      token,
      this.refreshSecret,
      this.verifyOptions
    ) as IJwtPayload;
  }
}

export { JwtService };
