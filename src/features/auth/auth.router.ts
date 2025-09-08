import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";
import { authController } from "./auth.controller.js";

const authRouter = express.Router();

authRouter.post(
  "/register",
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next)
);
authRouter.post("/login", (req: Request, res: Response, next: NextFunction) =>
  authController.login(req, res, next)
);
authRouter.post("/logout", (req: Request, res: Response, next: NextFunction) =>
  authController.logout(req, res, next)
);
authRouter.post(
  "/password-reset",
  (req: Request, res: Response, next: NextFunction) =>
    authController.initiatePasswordReset(req, res, next)
);
authRouter.post(
  "/password-reset/:confirm_token",
  (req: Request, res: Response, next: NextFunction) =>
    authController.resetPassword(req, res, next)
);
authRouter.post(
  "/verify-email",
  (req: Request, res: Response, next: NextFunction) =>
    authController.verifyEmail(req, res, next)
);

authRouter.post(
  "/token/refresh",
  (req: Request, res: Response, next: NextFunction) =>
    authController.refreshToken(req, res, next)
);
export { authRouter };
