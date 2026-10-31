import type { PGWrappedError } from "../@types";
import type { StatusCodes } from "http-status-codes";
import { DrizzleQueryError } from "drizzle-orm";
import postgres from "postgres";

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

export const isPgError = (error: unknown): error is PGWrappedError =>
  error instanceof DrizzleQueryError &&
  error.cause instanceof postgres.PostgresError;

export const isUniqueViolation = (error: unknown): boolean =>
  isPgError(error) && error.cause.code === "23505";
