import express from "express";
import { authController } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/register", (req, res) => authController.register(req, res));
authRouter.post("/login", (req, res) => authController.login(req, res));
authRouter.post("/logout", (req, res) => authController.logout(req, res));
authRouter.post("/password-reset", (req, res) =>
  authController.initiatePasswordReset(req, res)
);
authRouter.post("/password-reset/:confirm_token", (req, res) =>
  authController.resetPassword(req, res)
);

export { authRouter };
