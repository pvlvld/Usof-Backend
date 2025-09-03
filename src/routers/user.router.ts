import express from "express";
import { userController } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/", (req, res) => {
  res.send("User list");
});

userRouter.get("/:user_id", (req, res) => {
  userController.getUserById(req, res);
});

// ADMINS ONLY
userRouter.post("/", (req, res) => {
  userController.createUser(req, res);
});

userRouter.patch("/avatar", (req, res) => {
  userController.updateAvatar(req, res);
});

userRouter.patch("/:user_id", (req, res) => {
  userController.updateUser(req, res);
});

userRouter.delete("/:user_id", (req, res) => {
  userController.deleteUser(req, res);
});

// ADMIN ONLY
userRouter.post("/:user_id/ban", (req, res) => {
  userController.banUser(req, res);
});

// ADMIN ONLY
userRouter.post("/:user_id/unban", (req, res) => {
  const { user_id } = req.params;
  userController.unbanUser(req, res);
});

export { userRouter };
