import env from "../config/env.config";
import constant from "../config/constant.config";
import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import type {
  ChangePasswordSchema,
  SessionParamsSchema,
  CreateAccountSchema,
  ForgotPasswordSchema,
  LoginSchema,
  ResetPasswordSchema,
} from "../validations/auth.validation";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../lib/error";
import utils from "../lib/utils";
import token from "../lib/token";
import mail from "../lib/mailer";
import { and, desc, eq, gt, isNull, ne } from "drizzle-orm";
import db from "../db";
import {
  categories,
  passwordResetTokens,
  refreshTokens,
  users,
} from "../db/schema";
import bcrypt from "bcrypt";
import device from "../lib/device";

// Device info stored with each session (shown in the "Active sessions" list).
const sessionMeta = (req: Request) => ({
  userAgent: req.get("user-agent") ?? null,
  ipAddress: req.ip?.replace(/^::ffff:/, "") ?? null,
});

// The session (token family) of the refresh-token cookie sent with this request.
const getCurrentFamilyId = async (req: Request) => {
  const rawToken = req.cookies.refresh_token;
  if (!rawToken) return null;
  const [row] = await db
    .select({ familyId: refreshTokens.familyId })
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.token, token.HashToken(rawToken)),
        eq(refreshTokens.userId, req.user!.id),
        eq(refreshTokens.isRevoked, false),
      ),
    )
    .limit(1);
  return row?.familyId ?? null;
};

const countSessions = (rows: { familyId: string }[]) =>
  new Set(rows.map((r) => r.familyId)).size;

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
    const result = await token.SendAuthToken(
      res,
      newUser!,
      undefined,
      sessionMeta(req),
    );
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
    const result = await token.SendAuthToken(
      res,
      user,
      undefined,
      sessionMeta(req),
    );
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
    const result = await token.SendAuthToken(res, user, stored.familyId, {
      ...sessionMeta(req),
      sessionStartedAt: stored.sessionStartedAt,
    });
    return utils.SendSuccess(res, {
      message: "Token refreshed.",
      data: { accessToken: result.accessToken },
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body as ForgotPasswordSchema;
    const [user] = await db
      .select({ id: users.id, firstName: users.firstName, email: users.email })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await db.transaction(async (tx) => {
        await tx
          .delete(passwordResetTokens)
          .where(
            and(
              eq(passwordResetTokens.userId, user.id),
              isNull(passwordResetTokens.usedAt),
            ),
          );
        await tx.insert(passwordResetTokens).values({
          userId: user.id,
          token: token.HashToken(rawToken),
          expiresAt,
        });
      });
      const html = utils.ReadTemplate("ResetPasswordRequest.html", {
        firstName: user.firstName,
        resetPasswordLink: `${env.FRONTEND_URL}/reset-password?token=${rawToken}`,
        expiredAt: "15 minute.",
        support: env.BREVO_USER,
      });
      mail.SendMail({
        to: user.email,
        subject: "Reset your Expenso password",
        html,
      });
    }
    return utils.SendSuccess(res, {
      message:
        "If an account exists for this email, a reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token: resetPasswordToken, password } =
      req.body as ResetPasswordSchema;
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const updatedUser = await db.transaction(async (tx) => {
      const [used] = await tx
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(passwordResetTokens.token, token.HashToken(resetPasswordToken)),
            isNull(passwordResetTokens.usedAt),
            gt(passwordResetTokens.expiresAt, new Date()),
          ),
        )
        .returning({ userId: passwordResetTokens.userId });
      if (!used) return null;
      const [user] = await tx
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, used.userId))
        .returning({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
        });
      await tx
        .delete(refreshTokens)
        .where(eq(refreshTokens.userId, used.userId));
      return user;
    });
    if (!updatedUser)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Invalid or expired reset link.",
      );
    const changedAt = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
    const html = utils.ReadTemplate("ResetPasswordSuccess.html", {
      firstName: updatedUser.firstName,
      changedAt,
      support: env.BREVO_USER,
    });
    mail.SendMail({
      to: updatedUser.email,
      subject: "Your Expenso password was changed",
      html,
    });
    res.clearCookie("refresh_token", { path: constant.REFRESH_TOKEN_PATH });
    return utils.SendSuccess(res, {
      message: "Password reset. Please log in.",
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

const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user!;
    const { currentPassword, newPassword } = req.body as ChangePasswordSchema;
    // 400, not 401: the frontend treats 401 as "access token expired".
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Current password is incorrect.",
      );
    if (currentPassword === newPassword)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "New password must be different from the current one.",
      );
    const currentFamilyId = await getCurrentFamilyId(req);
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const signedOutSessions = await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));
      const revoked = await tx
        .update(refreshTokens)
        .set({ isRevoked: true })
        .where(
          and(
            eq(refreshTokens.userId, user.id),
            eq(refreshTokens.isRevoked, false),
            currentFamilyId
              ? ne(refreshTokens.familyId, currentFamilyId)
              : undefined,
          ),
        )
        .returning({ familyId: refreshTokens.familyId });
      return countSessions(revoked);
    });
    const changedAt = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
    const html = utils.ReadTemplate("ResetPasswordSuccess.html", {
      firstName: user.firstName,
      changedAt,
      support: env.BREVO_USER,
    });
    mail.SendMail({
      to: user.email,
      subject: "Your Expenso password was changed",
      html,
    });
    return utils.SendSuccess(res, {
      message: "Password changed successfully.",
      data: { signedOutSessions },
    });
  } catch (error) {
    next(error);
  }
};

const listSessions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const [rows, currentFamilyId] = await Promise.all([
      db
        .select({
          id: refreshTokens.familyId,
          userAgent: refreshTokens.userAgent,
          ipAddress: refreshTokens.ipAddress,
          startedAt: refreshTokens.sessionStartedAt,
          lastActiveAt: refreshTokens.createdAt,
        })
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.userId, userId),
            eq(refreshTokens.isRevoked, false),
            gt(refreshTokens.expiresAt, new Date()),
          ),
        )
        .orderBy(desc(refreshTokens.createdAt)),
      getCurrentFamilyId(req),
    ]);
    const sessions = rows
      .map((r) => ({
        id: r.id,
        device: device.describeDevice(r.userAgent),
        ipAddress: r.ipAddress,
        startedAt: r.startedAt,
        lastActiveAt: r.lastActiveAt,
        isCurrent: r.id === currentFamilyId,
      }))
      .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));
    return utils.SendSuccess(res, { data: { sessions } });
  } catch (error) {
    next(error);
  }
};

const revokeSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { id } = res.locals.params as SessionParamsSchema;
    const currentFamilyId = await getCurrentFamilyId(req);
    const revoked = await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.familyId, id),
          eq(refreshTokens.isRevoked, false),
        ),
      )
      .returning({ id: refreshTokens.id });
    if (revoked.length === 0)
      throw new ApiError(StatusCodes.NOT_FOUND, "Session not found.");
    const isCurrent = currentFamilyId === id;
    if (isCurrent)
      res.clearCookie("refresh_token", { path: constant.REFRESH_TOKEN_PATH });
    return utils.SendSuccess(res, {
      message: "Session signed out.",
      data: { isCurrent },
    });
  } catch (error) {
    next(error);
  }
};

const revokeOtherSessions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const currentFamilyId = await getCurrentFamilyId(req);
    const revoked = await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.isRevoked, false),
          currentFamilyId
            ? ne(refreshTokens.familyId, currentFamilyId)
            : undefined,
        ),
      )
      .returning({ familyId: refreshTokens.familyId });
    return utils.SendSuccess(res, {
      message: "Signed out of all other devices.",
      data: { signedOutSessions: countSessions(revoked) },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createAccount,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  changePassword,
  listSessions,
  revokeSession,
  revokeOtherSessions,
  logout,
};
