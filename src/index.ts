import express, { type Request, type Response } from "express";
import { apiRouter } from "./routers/api.router.js";
import cookieParser from "cookie-parser";
const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.redirect("/api");
});

app.use("/api", apiRouter);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
