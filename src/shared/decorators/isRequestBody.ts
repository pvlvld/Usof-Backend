import type { Request, Response, NextFunction } from "express";

export function isRequestBody() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send({
          error: "Bad Request",
          message: "Request body is missing or empty."
        });
      }

      return originalMethod.apply(this, [req, res, next]);
    };
  };
}
