import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  RegisterDto,
  LoginDto,
  PasswordResetRequestDto,
  PasswordResetDto,
  EmailVerificationDto
} from "../dto/auth.dto.js";
import { AuthService } from "../services/auth.service.js";
import { RefreshTokenModel } from "../models/refreshToken.model.js";
import { UserModel } from "../models/user.model.js";
import { UserService } from "../services/user.service.js";
import { isRequestBody } from "../decorators/isRequestBody.js";
import type { NextFunction, Request, Response } from "express";
import { PasswordResetsModel } from "../models/passwordResets.model.js";
import { EmailVerificationModel } from "../models/emailVerifications.model.js";
import crypto from "crypto";
import { EmailService } from "../services/email.service.js";
import { PasswordResetsService } from "../services/passwordResets.service.js";

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
    this.userService = UserService.getInstance(UserModel);
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

    if (dto.password !== dto.passwordConfirmation) {
      errors.push({
        property: "passwordConfirmation",
        constraints: {
          isNotEmpty: "Password confirmation should not be empty",
          isEqual: "Password confirmation does not match password"
        }
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const result = await this.authService.register(dto);
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
      const result = await this.authService.login(dto);
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

    // TODO: Validate token, update password in DB

    try {
      await this.userService.updatePassword(dto);
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

    // TODO: Validate token, update email in DB

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

    try {
      const accessToken = await this.authService.refreshAccessToken(
        refreshToken
      );
      if (accessToken) {
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 1000 * 60 * 15 // 15 minutes
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
