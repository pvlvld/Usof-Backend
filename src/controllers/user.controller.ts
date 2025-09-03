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

  @isRequestBody()
  public async getUserById(req: Request, res: Response) {
    const userData: GetUserByIdDTO = req.body;
    const errors = await validate(userData);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    this.userService
      .getUserById(userData)
      .then((user) => res.status(200).json(user))
      .catch((err) => res.status(500).json({ error: err.message }));
  }

  @isRequestBody()
  public async updateUser(req: Request, res: Response) {
    const userData: UpdateUserDataDTO = req.body;
    const errors = await validate(userData);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    this.userService
      .updateUser(userData)
      .then((user) => res.status(200).json(user))
      .catch((err) => res.status(500).json({ error: err.message }));
  }

  @isRequestBody()
  public async deleteUser(req: Request, res: Response) {
    const userData: DeleteUserDTO = req.body;
    const errors = await validate(userData);
  }
}

export const userController = new UserController();
