import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  RegisterDto,
  LoginDto,
  PasswordResetRequestDto,
  PasswordResetDto
} from "../dto/auth.dto.js";
import { AuthService } from "../services/auth.service.js";
import { RefreshTokenModel } from "../models/refreshToken.model.js";
import { UserModel } from "../models/user.model.js";
import { UserService } from "../services/user.service.js";
import { isRequestBody } from "../decorators/isRequestBody.js";
import type { Request, Response } from "express";

class AuthController {
  private authService: AuthService;
  private userService: UserService;
  constructor() {
    this.authService = AuthService.getInstance(RefreshTokenModel, UserModel);
    this.userService = UserService.getInstance(UserModel);
  }

  @isRequestBody()
  async register(req: Request, res: Response) {
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
          sameSite: "strict",
          maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        });
      }

      return res.status(201).json({
        message: "User registered successfully!"
      });
    } catch (err) {
      let status = 500;
      let message = "Registration failed";
      if (typeof err === "object" && err !== null) {
        status = (err as any).status || 500;
        message = (err as any).message || message;
      }

      return res.status(status).json({ message });
    }
  }

  @isRequestBody()
  public async login(req: Request, res: Response) {
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
          sameSite: "strict",
          maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        });
      }

      return res.status(200).json({
        message: "User logged in successfully!"
      });
    } catch (err) {
      let status = 500;
      let message = "Login failed";
      if (typeof err === "object" && err !== null) {
        status = (err as any).status || 500;
        message = (err as any).message || message;
      }

      return res.status(status).json({ message });
    }
  }

  public async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    try {
      await this.authService.logout({ refreshToken });

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
      let status = 500;
      let message = "Logout failed";
      if (typeof err === "object" && err !== null) {
        status = (err as any).status || 500;
        message = (err as any).message || message;
      }
      return res.status(status).json({ message });
    }
  }

  @isRequestBody()
  public async initiatePasswordReset(req: Request, res: Response) {
    const dto = plainToInstance(PasswordResetRequestDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // TODO: Generate reset token, save to DB, send email

    return res
      .status(200)
      .json({ message: "Password reset link sent to email!" });
  }

  @isRequestBody()
  public async resetPassword(req: Request, res: Response) {
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
    } catch (error) {
      return res.status(500).json({ message: "Password reset failed" });
    }
    return res.status(200).json({ message: "Password reset successful!" });
  }
}

export const authController = new AuthController();
