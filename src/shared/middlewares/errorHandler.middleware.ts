import type { Request, Response, NextFunction } from "express";
import { CustomError, UnsafeQueryError } from "../consts/errors.js";
import { authenticateMiddleware } from "./auth.middleware.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof CustomError) {
    if (err instanceof UnsafeQueryError) {
      authenticateMiddleware(req, res, () => {}, true);
      const userInfo = <Record<string, unknown>>(req.user ?? {});
      userInfo["ip"] = req.ip;
      userInfo["user-agent"] = req.headers["user-agent"];

      console.error(
        "[GlobalErrorHandler] Unsafe query detected:",
        err._query,
        `Request info: ${req.method} ${req.originalUrl}`,
        `User info: ${JSON.stringify(userInfo)}`
      );
      res.status(err.statusCode).json({ error: "Bad Request" });
    } else {
      res.status(err.statusCode).json({ error: err.message });
    }
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
