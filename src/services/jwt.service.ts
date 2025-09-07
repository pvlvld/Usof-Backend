import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

import type { JwtPayload as JwtPayloadBase } from "jsonwebtoken";

type JwtPayload = JwtPayloadBase & {
  sub: string;
  role?: string;
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

  public signAccessToken(payload: JwtPayload) {
    const options: jwt.SignOptions = {
      expiresIn: this.accessExpiresIn,
      algorithm: this.algorithm
    };
    return jwt.sign(payload, this.accessSecret as jwt.Secret, options);
  }

  public signRefreshToken(payload: JwtPayload) {
    const options: jwt.SignOptions = {
      expiresIn: this.refreshExpiresIn,
      algorithm: this.algorithm
    };
    return jwt.sign(payload, this.refreshSecret as jwt.Secret, options);
  }

  public verifyAccessToken(token: string) {
    return jwt.verify(token, this.accessSecret, this.verifyOptions);
  }

  public verifyRefreshToken(token: string) {
    return jwt.verify(token, this.refreshSecret, this.verifyOptions);
  }
}

export { JwtService };
