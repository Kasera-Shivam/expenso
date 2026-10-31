import env from "./config/env.config";
import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ApiError } from "./lib/error";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import db from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import type { Schemas } from "./@types";

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
  (schemas: Schemas) => (req: Request, res: Response, next: NextFunction) => {
    const sources = {
      query: req.query,
      params: req.params,
      body: req.body ?? {},
    } as const;
    for (const key of ["query", "params", "body"] as const) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(sources[key]);
      if (!result.success) {
        const issue = result.error.issues[0];
        const message = issue ? issue.message : "Something went wrong.";
        return next(new ApiError(StatusCodes.BAD_REQUEST, message));
      }
      if (key === "body") req.body = result.data;
      else res.locals[key] = result.data;
    }
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
