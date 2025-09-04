import { validate } from "class-validator";
import {
  GetUsersDto,
  type CreateUserDTO,
  type DeleteUserDTO,
  type GetUserByIdDTO,
  type UpdateUserDataDTO
} from "../dto/user.dto.js";
import type { Request, Response } from "express";
import { isRequestBody } from "../decorators/isRequestBody.js";
import { UserService } from "../services/user.service.js";
import { UserModel } from "../models/user.model.js";
import { plainToInstance } from "class-transformer";
import { PasswordResetsService } from "../services/passwordResets.service.js";
import { PasswordResetsModel } from "../models/passwordResets.model.js";
import { EmailDTO } from "../dto/passwordResets.dto.js";

class PasswordResetsController {
  private passwordResetsService: PasswordResetsService;
  private userService: UserService;
  constructor() {
    this.passwordResetsService = PasswordResetsService.getInstance(
      PasswordResetsModel,
      UserModel
    );
    this.userService = UserService.getInstance(UserModel);
  }

  @isRequestBody()
  public async requestPasswordReset(req: Request, res: Response) {
    const dto = plainToInstance(EmailDTO, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({
        error: "Invalid email"
      });
    }

    const token = await this.passwordResetsService.getPasswordResetToken(
      dto.email
    );
    // TODO: Send email with token
    return res.status(200).json({ message: "Password reset email sent" });
  }

  public async deleteUser(req: Request, res: Response) {
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

    this.userService
      .deleteUser({ user_id: +user_id })
      .then(() => res.status(204).send())
      .catch((err) => res.status(500).json({ error: err.message }));
  }
}

export const passwordResetsController = new PasswordResetsController();
