import type { NextFunction, Request, Response } from "express";
import type { UpdateAccountSchema } from "../validations/account.validation";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../lib/error";
import utils from "../lib/utils";
import db from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { uploadAvatar } from "../lib/cloudinary";

const fetchMyAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user!;
    const { password: _, ...safeUser } = user;
    return utils.SendSuccess(res, { data: { user: safeUser } });
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file)
      throw new ApiError(StatusCodes.BAD_REQUEST, "Avatar image is required.");
    const url = await uploadAvatar(req.file.buffer, req.user!.id);
    const [user] = await db
      .update(users)
      .set({ avatar: url })
      .where(eq(users.id, req.user!.id))
      .returning({ id: users.id, avatar: users.avatar });
    return utils.SendSuccess(res, {
      message: "Avatar updated.",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const updateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const body = req.body as UpdateAccountSchema;
    const [user] = await db
      .update(users)
      .set({ ...body })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found.");
    const { password: _, ...safeUser } = user;
    return utils.SendSuccess(res, {
      message: "Account updated successfully.",
      data: { user: safeUser },
    });
  } catch (error) {
    next(error);
  }
};

export default { fetchMyAccount, updateAvatar, updateAccount };
