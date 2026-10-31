import env from "./config/env.config";
import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ApiError } from "./lib/error";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import db from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

const ErrorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (env.NODE_ENV !== "production") console.log(error);
  if (error instanceof ApiError)
    return res.status(error.status).json({ message: error.message });
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ message: "Something went wrong." });
};

const ValidateSchema =
  (schema: ZodType) => (req: Request, _: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message =
        result.error.issues[0]?.message ?? "Something went wrong.";
      return next(new ApiError(StatusCodes.BAD_REQUEST, message));
    }
    req.body = result.data;
    next();
  };

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Access token missing.");
    const token = header.split(" ")[1];
    if (!token)
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Access token missing.");
    let payload: { id: string };
    try {
      payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as { id: string };
    } catch (error) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid or expired access token.",
      );
    }
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.id))
      .limit(1);
    if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found.");
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default { ErrorHandler, ValidateSchema, isAuthenticated };
