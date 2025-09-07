import { validate } from "class-validator";
import type { NextFunction, Request, Response } from "express";
import { isRequestBody } from "../decorators/isRequestBody.js";
import { UserService } from "../services/user.service.js";
import { UserModel } from "../models/user.model.js";
import { plainToInstance } from "class-transformer";
import { PasswordResetsService } from "../services/passwordResets.service.js";
import { PasswordResetsModel } from "../models/passwordResets.model.js";
import { EmailDTO } from "../dto/passwordResets.dto.js";
import { EmailService } from "../services/email.service.js";

class PasswordResetsController {
  private passwordResetsService: PasswordResetsService;
  private userService: UserService;
  private emailService: EmailService;
  constructor() {
    this.passwordResetsService = PasswordResetsService.getInstance(
      PasswordResetsModel,
      UserModel
    );
    this.userService = UserService.getInstance(UserModel);
    this.emailService = EmailService.getInstance();
  }

  @isRequestBody()
  public async requestPasswordReset(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const dto = plainToInstance(EmailDTO, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    try {
      const token = await this.passwordResetsService.createResetEntry(
        dto.email
      );
      await this.emailService.sendPasswordResetEmail(dto.email, token);
      res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      next(error);
    }
  }

  public async deleteUser(req: Request, res: Response, next: NextFunction) {
    const { user_id } = req.params;
    if (!user_id || isNaN(Number(user_id))) {
      return res.status(400).json({
        errors: [
          {
            property: "user_id",
            constraints: { isNumber: "user_id must be a number" }
          }
        ]
      });
    }

    try {
      await this.userService.deleteUser({ user_id: +user_id });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const passwordResetsController = new PasswordResetsController();
