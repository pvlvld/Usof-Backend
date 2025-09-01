import express from "express";

const userRouter = express.Router();

userRouter.get("/", (req, res) => {
  res.send("User list");
});

userRouter.get("/:user_id", (req, res) => {
  const { user_id } = req.params;
  res.send(`User details for user ID: ${user_id}`);
});

// ADMINS ONLY
userRouter.post("/", (req, res) => {
  if (1) {
    throw new Error("Only admins can create users");
  }
  const { login, password, passwordConfirmation, email, role } = req.body;
  res.status(201).send("User created");
});

userRouter.patch("/avatar", (req, res) => {
  res.send(`Profile picture updated`);
});

userRouter.patch("/:user_id", (req, res) => {
  const { user_id } = req.params;
  // Partial<UserModel>
  res.send(`User details updated for user ID: ${user_id}`);
});

userRouter.delete("/:user_id", (req, res) => {
  const { user_id } = req.params;
  res.send(`User deleted for user ID: ${user_id}`);
});

export { userRouter };
