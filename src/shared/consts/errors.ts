export class CustomError extends Error {
  statusCode: number;
  isCustomError: true = true;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class BadRequestError extends CustomError {
  constructor(message: string = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = "Not Found") {
    super(message, 404);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = "Conflict") {
    super(message, 409);
  }
}

export class GoneError extends CustomError {
  constructor(message: string = "Gone") {
    super(message, 410);
  }
}

export class InternalServerError extends CustomError {
  constructor(message: string = "Internal Server Error") {
    super(message, 500);
  }
}

export class UnsafeQueryError extends CustomError {
  public _query: string;
  constructor(query: string, message: string = "Bad Request") {
    super(message, 400);
    this._query = query;
  }
}
