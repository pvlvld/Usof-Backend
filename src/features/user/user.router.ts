import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";
import { userController } from "./user.controller.js";
import {
  authenticateMiddleware,
  requireAdminMiddleware
} from "../../shared/middlewares/auth.middleware.js";
import { uploadAvatarMiddleware } from "../../shared/middlewares/uploadImage.middleware.js";
import { UserService } from "./user.service.js";

const userRouter = express.Router();

userRouter.get(
  "/me",
  authenticateMiddleware,
  async (req: Request, res: Response) => {
    await userController.getMe(req, res);
  }
);

userRouter.get(
  "/:user_id/avatar",
  async (req: Request, res: Response, next: NextFunction) => {
    userController.getAvatar(req, res, next);
  }
);

userRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  userController.getUsers(req, res, next);
});

userRouter.get(
  "/:user_id",
  (req: Request, res: Response, next: NextFunction) => {
    userController.getUserById(req, res, next);
  }
);

userRouter.get(
  "/:user_id/comments",
  (req: Request, res: Response, next: NextFunction) => {
    userController.getUserComments(req, res, next);
  }
);

// ADMINS ONLY
userRouter.post(
  "/",
  authenticateMiddleware,
  requireAdminMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    userController.createUser(req, res, next);
  }
);

userRouter.patch(
  "/avatar",
  authenticateMiddleware,
  uploadAvatarMiddleware.single("avatar"),
  (req: Request, res: Response) => {
    if (req.user) {
      userController.setAvatar(req.user.id);
    }

    res
      .status(200)
      .json({ message: "Avatar uploaded successfully", file: req.file });
  }
);

// TODO: how in da hell create regex route?
// https://expressjs.com/en/guide/routing.html
// https://github.com/pillarjs/path-to-regexp
// https://bjohansebas.github.io/playground-router/
userRouter.patch(
  "/:user_id",
  authenticateMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.params;
    if (user_id === "avatar") {
      return next();
    }
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
