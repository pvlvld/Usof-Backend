import { BadRequestError } from "../consts/errors.js";

export function validateUserIdParam(req, res, next) {
  const paramValue = req.params.user_id;
  if (isNaN(paramValue)) {
    throw new BadRequestError("Invalid user_id. Must be a number.");
  }
  req.params.user_id = parseInt(paramValue);
  next();
}
