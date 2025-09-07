import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";
import { userController } from "../controllers/user.controller.js";
import multer from "multer";
import path from "node:path";
import {
  authenticateMiddleware,
  requireAdminMiddleware
} from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

// TODO:
// - Utilize auth data to get user_id
// - Move to the controller
// - Convert all to the webp
// - Async i/o? If possible
const uploadAvatar = multer({
  dest: "public/uploads/avatars/",
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and WEBP are allowed."));
    }
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads/avatars/");
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      console.log(file);
      console.log(req.body);
      const filename = `avatar_${req.body.user_id}${ext}`;
      cb(null, filename);
    }
  })
});

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
  uploadAvatar.single("avatar")
);

// TODO: how in da hell create regex route?
// https://expressjs.com/en/guide/routing.html
// https://github.com/pillarjs/path-to-regexp
// https://bjohansebas.github.io/playground-router/
userRouter.patch(
  "/:user_id",
  authenticateMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    console.log("Update user");
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
