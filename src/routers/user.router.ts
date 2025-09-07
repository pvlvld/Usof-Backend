import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";
import { userController } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  userController.getUsers(req, res, next);
});

userRouter.get(
  "/:user_id",
  (req: Request, res: Response, next: NextFunction) => {
    userController.getUserById(req, res, next);
  }
);

// ADMINS ONLY
userRouter.post("/", (req: Request, res: Response, next: NextFunction) => {
  userController.createUser(req, res, next);
});

userRouter.patch(
  "/avatar",
  (req: Request, res: Response, next: NextFunction) => {
    userController.updateAvatar(req, res, next);
  }
);

userRouter.patch(
  "/:user_id",
  (req: Request, res: Response, next: NextFunction) => {
    userController.updateUser(req, res, next);
  }
);

userRouter.delete(
  "/:user_id",
  (req: Request, res: Response, next: NextFunction) => {
    userController.deleteUser(req, res, next);
  }
);

// ADMIN ONLY
userRouter.post(
  "/:user_id/ban",
  (req: Request, res: Response, next: NextFunction) => {
    userController.banUser(req, res, next);
  }
);

// ADMIN ONLY
userRouter.post(
  "/:user_id/unban",
  (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.params;
    userController.unbanUser(req, res, next);
  }
);

export { userRouter };
