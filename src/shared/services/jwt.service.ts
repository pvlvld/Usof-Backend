import jwt from "jsonwebtoken";
import ms from "ms";

import type { StringValue } from "ms";
import type { JwtPayload as JwtPayloadBase } from "jsonwebtoken";
import type { IUserRole } from "../../features/user/user.dto.js";

type IJwtPayload = JwtPayloadBase & {
  sub: string;
};

export type IJwtPayloadAuth = IJwtPayload & {
  role: IUserRole;
};

function StringValueTypeGuard(value: unknown): value is StringValue {
  if (typeof value === "number") return true;
  return ms(value as any) !== undefined;
}

class JwtService {
  private static instance: JwtService | null = null;
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: StringValue | number;
  private readonly refreshExpiresIn: StringValue | number;

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

    const rawAccessTtl = process.env.JWT_ACCESS_TTL || "15m";
    this.accessExpiresIn = ms(<StringValue>rawAccessTtl) || ms("15m");

    const rawRefreshTtl = process.env.JWT_REFRESH_TTL || "30d";
    this.refreshExpiresIn = ms(<StringValue>rawRefreshTtl) || ms("30d");
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
