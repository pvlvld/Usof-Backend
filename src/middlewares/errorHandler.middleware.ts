import type { Request, Response, NextFunction } from "express";
import { CustomError } from "../consts/errors.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    console.error("[GlobalErrorHandler] Unexpected error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      ...(process.env.NODE_ENV !== "production" && {
        stack: (err as Error).stack
      })
    });
  }
}
