import { validate } from "class-validator";
import {
  GetUsersDto,
  CreateUserDTO,
  GetUserByIdDTO,
  UpdateUserDataDTO,
  UserResponseDTO
} from "./user.dto.js";
import type { NextFunction, Request, Response } from "express";
import { isRequestBody } from "../../shared/decorators/isRequestBody.js";
import { UserService } from "./user.service.js";
import { plainToInstance } from "class-transformer";
import { UserModel } from "./user.model.js";
import { AuthService } from "../auth/auth.service.js";
import {
  ForbiddenError,
  UnauthorizedError
} from "../../shared/consts/errors.js";

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = UserService.getInstance(UserModel, AuthService);
  }

  public async getMe(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const user = await this.userService.getUserById({ user_id: req.user.id });
    res.status(200).json(UserResponseDTO.fromUserModel(user));
  }

  public async getUsers(req: Request, res: Response, next: NextFunction) {
    req.query ??= {};
    const dto: GetUsersDto = plainToInstance(GetUsersDto, req.query);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const users = await this.userService.getUsers(dto);
      const usersResponse = users.map((user) =>
        UserResponseDTO.fromUserModel(user as any)
      );
      res.status(200).json(usersResponse);
    } catch (err) {
      next(err);
    }
  }

  @isRequestBody()
  public async createUser(req: Request, res: Response, next: NextFunction) {
    const userData = plainToInstance(CreateUserDTO, req.body);
    const errors = await validate(userData);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const user = await this.userService.createUser(userData);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  public async getUserById(req: Request, res: Response, next: NextFunction) {
    const dto = plainToInstance(GetUserByIdDTO, req.params);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const user = await this.userService.getUserById(dto);
      const userResponse = UserResponseDTO.fromUserModel(user);
      res.status(200).json(userResponse);
    } catch (err) {
      next(err);
    }
  }

  @isRequestBody()
  public async updateUser(req: Request, res: Response, next: NextFunction) {
    const { user_id } = req.params;
    req.body ??= {};
    req.body.user_id = user_id;

    const userData = plainToInstance(UpdateUserDataDTO, req.body, {
      exposeUnsetFields: false
    });

    const errors = await validate(userData, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: true
    });

    if (req.user?.id !== userData.user_id && req.user?.role !== "admin") {
      return next(new ForbiddenError("You can only update your own profile"));
    }

    if (req.user?.role !== "admin") {
      if (userData.role) {
        return next(new ForbiddenError("Only admins can change user roles"));
      }
      if (userData.banned_until || userData.ban_reason) {
        return next(new ForbiddenError("Only admins can ban users"));
      }
      if (userData.deleted_at) {
        return next(new ForbiddenError("Only admins can delete users"));
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      await this.userService.updateUser(userData);
      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  public async updateAvatar(req: Request, res: Response, next: NextFunction) {
    throw new Error("Method not implemented.");
  }

  public async getAvatar(req: Request, res: Response, next: NextFunction) {
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

    const avatarBuffer = await this.userService.getUserAvatar(+user_id);
    if (avatarBuffer) {
      res.type("image/webp").send(avatarBuffer);
    } else {
      res.status(404).json({ message: "Avatar not found" });
    }
  }

  public async banUser(req: Request, res: Response, next: NextFunction) {
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
    req.body ??= {};
    let isPermanent = false;
    let { banned_until, ban_reason } = req.body;
    ban_reason ??= "No reason provided";

    if (banned_until && !Date.parse(banned_until)) {
      return res.status(400).json({
        errors: [
          {
            property: "banned_until",
            constraints: {
              isDate:
                "banned_until must be a valid date or empty for permanent ban"
            }
          }
        ]
      });
    }

    if (banned_until) {
      banned_until = new Date(banned_until);
    } else {
      isPermanent = true;
      banned_until = new Date(0);
    }

    try {
      const [result] = await this.userService.banUser({
        user_id: +user_id,
        banned_until,
        ban_reason
      });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(204).send({
        message: `User banned successfully`,
        until: banned_until
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  public async unbanUser(req: Request, res: Response, next: NextFunction) {
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
      const [result] = await this.userService.unbanUser({ user_id: +user_id });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(204).send();
    } catch (err) {
      next(err);
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
      const result = await this.userService.deleteUser({ user_id: +user_id });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(204).json({ message: "User deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
