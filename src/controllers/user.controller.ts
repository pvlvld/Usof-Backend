import { validate } from "class-validator";
import type {
  CreateUserDTO,
  DeleteUserDTO,
  GetUserByIdDTO,
  UpdateUserDataDTO
} from "../dto/user.dto.js";
import type { Request, Response } from "express";
import { isRequestBody } from "../decorators/isRequestBody.js";
import { UserService } from "../services/user.service.js";
import { UserModel } from "../models/user.model.js";

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = UserService.getInstance(UserModel);
  }

  @isRequestBody()
  public async createUser(req: Request, res: Response) {
    const userData: CreateUserDTO = req.body;
    const errors = await validate(userData);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    this.userService
      .createUser(userData)
      .then((user) => res.status(201).json(user))
      .catch((err) => res.status(500).json({ error: err.message }));
  }

  // TODO: Filter sensitive data
  public async getUserById(req: Request, res: Response) {
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
      .getUserById({ user_id: +user_id })
      .then((user) => res.status(200).json(user))
      .catch((err) => res.status(500).json({ error: err.message }));
  }

  @isRequestBody()
  public async updateUser(req: Request, res: Response) {
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

    const userData: UpdateUserDataDTO = req.body;
    const errors = await validate(userData);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Oh God how mutch I hate spreads... but ok
    const updateData = {
      ...userData,
      user_id: +user_id
    };

    this.userService
      .updateUser(updateData)
      .then((user) => res.status(200).json(user))
      .catch((err) => res.status(500).json({ error: err.message }));
  }

  public updateAvatar(req: Request, res: Response) {
    throw new Error("Method not implemented.");
  }

  @isRequestBody()
  public banUser(req: Request, res: Response) {
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

    this.userService
      .banUser({ user_id: +user_id, banned_until, ban_reason })
      .then(() =>
        res.status(204).send({
          message: isPermanent
            ? `User banned permanently`
            : `User banned successfully until ${banned_until.toDateString()}`
        })
      )
      .catch((err) => res.status(500).json({ error: err.message }));
  }

  @isRequestBody()
  public unbanUser(req: Request, res: Response) {
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
      .unbanUser({ user_id: +user_id })
      .then(() => res.status(204).send())
      .catch((err) => res.status(500).json({ error: err.message }));
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

export const userController = new UserController();
