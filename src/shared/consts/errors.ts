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

export class UserBannedError extends ForbiddenError {
  public readonly isPermanent: boolean;
  public readonly expiresAt: Date | undefined;
  public readonly bannedAt: Date | undefined;

  constructor(
    message: string,
    options: {
      isPermanent: boolean;
      expiresAt?: Date;
      bannedAt?: Date;
    }
  ) {
    super(message);
    this.name = "UserBannedError";
    this.isPermanent = options.isPermanent;
    this.expiresAt = options.expiresAt;
    this.bannedAt = options.bannedAt;
  }

  static permanent(): UserBannedError {
    return new UserBannedError(
      "Your account has been permanently banned. Please contact support for assistance.",
      { isPermanent: true }
    );
  }

  static temporary(expiresAt: Date): UserBannedError {
    const expirationText = expiresAt.toLocaleString();
    return new UserBannedError(
      `Your account is temporarily banned until ${expirationText}. Please try again after this time.`,
      { isPermanent: false, expiresAt }
    );
  }
}
