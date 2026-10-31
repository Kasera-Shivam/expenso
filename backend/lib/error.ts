import type { StatusCodes } from "http-status-codes";

export class ApiError extends Error {
  public status: StatusCodes;

  constructor(status: StatusCodes, message?: string) {
    super(message);
    this.status = status;
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, new.target);
  }
}
