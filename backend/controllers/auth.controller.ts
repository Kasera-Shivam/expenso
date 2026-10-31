import constant from "../config/constant.config";
import type { Request, Response, NextFunction } from "express";
import type {
  CreateAccountSchema,
  LoginSchema,
} from "../validations/auth.validation";
import { ApiError } from "../lib/error";
import utils from "../lib/utils";
import token from "../lib/token";
import { StatusCodes } from "http-status-codes";
import { eq } from "drizzle-orm";
import db from "../db";
import { categories, refreshTokens, users } from "../db/schema";
import bcrypt from "bcrypt";

const createAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { firstName, lastName, email, password } =
      req.body as CreateAccountSchema;
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser)
      throw new ApiError(StatusCodes.CONFLICT, "Email already exists.");
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ firstName, lastName, email, password: hashedPassword })
        .returning();
      await tx
        .insert(categories)
        .values(
          constant.DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: user!.id })),
        );
      return user;
    });
    const result = await token.SendAuthToken(res, newUser!);
    return utils.SendSuccess(res, {
      status: StatusCodes.CREATED,
      message: "Account created successfully.",
      data: { ...result },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as LoginSchema;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user)
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid email or password.",
      );
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid email or password.",
      );
    const result = await token.SendAuthToken(res, user);
    return utils.SendSuccess(res, {
      message: "Login successfully.",
      data: { ...result },
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawToken = req.cookies.refresh_token;
    console.log(rawToken);
    if (!rawToken)
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token missing.");
    const [stored] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token.HashToken(rawToken)))
      .limit(1);
    if (!stored) {
      res.clearCookie("refresh_token", { path: constant.REFRESH_TOKEN_PATH });
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token.");
    }
    if (stored.isRevoked) {
      await db
        .update(refreshTokens)
        .set({ isRevoked: true })
        .where(eq(refreshTokens.familyId, stored.familyId));
      res.clearCookie("refresh_token", { path: constant.REFRESH_TOKEN_PATH });
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Session expired. Please login again.",
      );
    }
    if (stored.expiresAt < new Date()) {
      res.clearCookie("refresh_token", { path: constant.REFRESH_TOKEN_PATH });
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Session expired. Please login again.",
      );
    }
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, stored.userId))
      .limit(1);
    if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found.");
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.id, stored.id));
    const result = await token.SendAuthToken(res, user, stored.familyId);
    return utils.SendSuccess(res, {
      message: "Token refreshed.",
      data: { accessToken: result.accessToken },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawToken = req.cookies.refresh_token;
    if (rawToken)
      await db
        .update(refreshTokens)
        .set({ isRevoked: true })
        .where(eq(refreshTokens.token, token.HashToken(rawToken)));
    res.clearCookie("refresh_token", { path: constant.REFRESH_TOKEN_PATH });
    return utils.SendSuccess(res, { message: "Logout successfully." });
  } catch (error) {
    next(error);
  }
};

export default { createAccount, login, refresh, logout };
