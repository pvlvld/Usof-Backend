import express from "express";

const authRouter = express.Router();

authRouter.post("/register", (req, res) => {
  const { login, password, passwordConfirmation, email } = req.body;
  res.status(201).send({
    message: "User registered successfully!"
  });
});

authRouter.post("/login", (req, res) => {
  const { login, email, password } = req.body;
  res.status(200).send({
    message: "User logged in successfully!"
  });
});

authRouter.post("/logout", (req, res) => {
  res.status(200).send({
    message: "User logged out successfully!"
  });
});

authRouter.post("/password-reset", (req, res) => {
  const { email } = req.body;
  res.status(200).send({
    message: "Password reset link sent to email!"
  });
});

authRouter.post("/password-reset/:confirm_token", (req, res) => {
  const { confirm_token } = req.params;
  res.status(200).send({
    message: `Password reset successful!`
  });
});

export { authRouter };
