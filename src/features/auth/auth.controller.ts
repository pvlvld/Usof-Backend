import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  RegisterDto,
  LoginDto,
  PasswordResetRequestDto,
  PasswordResetDto,
  EmailVerificationDto
} from "./auth.dto.js";
import { AuthService, type IUserLoginInfo } from "./auth.service.js";
import { RefreshTokenModel } from "./refreshToken/refreshToken.model.js";
import { UserService } from "../user/user.service.js";
import { isRequestBody } from "../../shared/decorators/isRequestBody.js";
import type { NextFunction, Request, Response } from "express";
import { EmailVerificationModel } from "./emailVerification/emailVerifications.model.js";
import crypto from "node:crypto";
import { PasswordResetsService } from "./passwordReset/passwordResets.service.js";
import { EmailService } from "../../shared/services/email.service.js";
import { UserModel } from "../user/user.model.js";
import { PasswordResetsModel } from "./passwordReset/passwordResets.model.js";

class AuthController {
  private authService: AuthService;
  private userService: UserService;
  private emailService: EmailService;
  private passwordResetsService: PasswordResetsService;
  constructor() {
    this.authService = AuthService.getInstance(
      RefreshTokenModel,
      UserModel,
      EmailVerificationModel
    );
    this.userService = UserService.getInstance(UserModel, AuthService);
    this.emailService = EmailService.getInstance();
    this.passwordResetsService = PasswordResetsService.getInstance(
      PasswordResetsModel,
      UserModel
    );
  }

  @isRequestBody()
  async register(req: Request, res: Response, next: NextFunction) {
    const dto = plainToInstance(RegisterDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const userLoginInfo: IUserLoginInfo = {
      ip: req.ip!,
      user_agent: req.headers["user-agent"] || ""
    };

    if (!userLoginInfo.ip || !userLoginInfo.user_agent) {
      return res
        .status(400)
        .json({ message: "User login information is incomplete" });
    }

    try {
      const result = await this.authService.register(dto, userLoginInfo);
      if (result.accessToken) {
        res.cookie("accessToken", result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 1000 * 60 * 15 // 15 minutes
        });
      }
      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict"
        });
      }

      return res.status(201).json({
        message: "User registered successfully!"
      });
    } catch (err) {
      next(err);
    }
  }

  @isRequestBody()
  public async login(req: Request, res: Response, next: NextFunction) {
    const dto = plainToInstance(LoginDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      // Pass refreshToken from cookies if present
      const refreshTokenFromClient = req.cookies?.refreshToken;
      const result = await this.authService.login(dto, refreshTokenFromClient);
      if (result.accessToken) {
        res.cookie("accessToken", result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 1000 * 60 * 15 // 15 minutes
        });
      }
      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict"
        });
      }

      return res.status(200).json({
        message: "User logged in successfully!"
      });
    } catch (err) {
      next(err);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.cookies?.refreshToken;
    try {
      if (refreshToken) {
        await this.authService.logout({ refreshToken });
      }

      // Try to logout even if refreshToken is not present, i'm not greedy :D
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
      });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
      });
      return res.status(200).json({ message: "User logged out successfully!" });
    } catch (err) {
      next(err);
    }
  }

  @isRequestBody()
  public async initiatePasswordReset(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const dto = plainToInstance(PasswordResetRequestDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const user = await this.userService.findUserByLoginOrEmail(dto.email);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const resetEntry = await this.passwordResetsService.createResetEntry(
        dto.email
      );

      if (!resetEntry) {
        return res
          .status(500)
          .json({ message: "Could not create reset entry" });
      }

      await this.emailService.sendPasswordResetEmail(dto.email, token);
      return res
        .status(200)
        .json({ message: "Password reset link sent to email!" });
    } catch (error) {
      next(error);
    }
  }

  @isRequestBody()
  public async resetPassword(req: Request, res: Response, next: NextFunction) {
    const dto = plainToInstance(PasswordResetDto, {
      ...req.body,
      confirm_token: req.params.confirm_token
    });
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const resetEntry = await this.passwordResetsService.validateToken(
        dto.confirm_token
      );

      if (!resetEntry) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      if (resetEntry.expiresAt < new Date()) {
        await this.passwordResetsService.invalidateToken(dto.confirm_token);
        return res.status(400).json({ message: "Token has expired" });
      }

      const updatedDto = { ...dto, userId: resetEntry.userId };
      await this.userService.updatePassword(updatedDto);

      await this.passwordResetsService.invalidateToken(dto.confirm_token);

      return res.status(200).json({ message: "Password reset successful!" });
    } catch (error) {
      next(error);
    }
  }

  public async verifyEmail(req: Request, res: Response, next: NextFunction) {
    req.params ??= {};
    const dto = plainToInstance(EmailVerificationDto, req.params);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Invalid token" });
    }

    try {
      await this.authService.verifyEmail(dto);
      return res
        .status(200)
        .json({ message: "Email verification successful!" });
    } catch (error) {
      next(error);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const userLoginInfo: IUserLoginInfo = {
      ip: req.ip!,
      user_agent: req.headers["user-agent"] || ""
    };

    if (!userLoginInfo.ip || !userLoginInfo.user_agent) {
      return res
        .status(400)
        .json({ message: "User login information is incomplete" });
    }

    try {
      const result = await this.authService.refreshAccessToken(
        refreshToken,
        userLoginInfo
      );
      if (result.accessToken) {
        res.cookie("accessToken", result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 1000 * 60 * 15 // 15 minutes
        });
      }
      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict"
        });
      }

      return res.status(200).json({
        message: "Tokens refreshed successfully!"
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
