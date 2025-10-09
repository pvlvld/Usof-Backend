import type { Request, Response, NextFunction } from "express";
import {
  UnauthorizedError,
  ForbiddenError,
  CustomError
} from "../consts/errors.js";
import { JwtService } from "../services/jwt.service.js";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface UserInfo {
      id: number;
      role: string;
    }
    interface Request {
      user?: UserInfo;
    }
  }
}

export function authenticateMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
  isOptional: boolean = false
) {
  req.user ??= {} as any;
  try {
    let token = "";
    // Just in case
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")?.[1] || "";
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    if (!token) throw new UnauthorizedError("No access token provided");

    const payload = JwtService.getInstance().verifyAccessToken(token);

    req.user = {
      id: +payload.sub,
      role: payload.role
    };
    if (isOptional && (!req.user.id || !req.user.role)) {
      throw new UnauthorizedError("Invalid token payload");
    }
    next();
  } catch (err) {
    if (isOptional) {
      return next();
    }
    if (err instanceof CustomError) {
      next(err);
    } else {
      console.error("Authentication error:", err);
      next(new UnauthorizedError("Invalid or expired access token"));
    }
  }
}

export function requireAdminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== "admin") {
    return next(new ForbiddenError("Admin access required"));
  }
  next();
}

export function requireDonatorMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user || (req.user.role !== "donator" && req.user.role !== "admin")) {
    return next(new ForbiddenError("Donator or Admin access required"));
  }
  next();
}

export function requireUserOnlyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== "user") {
    return next(new ForbiddenError("User access required"));
  }
  next();
}

export function requireModeratorMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (
    !req.user ||
    (req.user.role !== "admin" && req.user.role !== "moderator")
  ) {
    return next(new ForbiddenError("Moderator or Admin access required"));
  }
  next();
}

export function requireAuthCustomMiddleware(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError("Access denied"));
    }
    next();
  };
}
