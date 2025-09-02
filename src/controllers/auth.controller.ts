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

class AuthController {
  private authService: AuthService;
  private userService: UserService;
  constructor() {
    this.authService = AuthService.getInstance(RefreshTokenModel, UserModel);
    this.userService = UserService.getInstance(UserModel);
  }

  async register(req, res) {
    const dto = plainToInstance(RegisterDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const result = await this.authService.register(dto);

      return res.status(201).json({
        message: "User registered successfully!",
        ...result
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

  async login(req, res) {
    const dto = plainToInstance(LoginDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const result = await this.authService.login(dto);

      return res.status(200).json({
        message: "User logged in successfully!",
        ...result
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

  async logout(req, res) {
    const { refreshToken } = req.body;
    try {
      await this.authService.logout({ refreshToken });
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

  async initiatePasswordReset(req, res) {
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

  async resetPassword(req, res) {
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
