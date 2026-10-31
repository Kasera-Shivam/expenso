import env from "../config/env.config";
import constant from "../config/constant.config";
import crypto from "node:crypto";
import type { Response } from "express";
import type { User } from "../@types";
import jwt from "jsonwebtoken";
import db from "../db";
import { refreshTokens } from "../db/schema";

const HashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const SendAuthToken: (
  res: Response,
  user: User,
  familyId?: string,
) => Promise<Record<string, unknown>> = async (
  res: Response,
  user: User,
  familyId?: string,
): Promise<Record<string, unknown>> => {
  const accessToken = jwt.sign({ id: user.id }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const rawRefreshToken = crypto.randomBytes(32).toString("hex");
  await db.insert(refreshTokens).values({
    ...(familyId && { familyId }),
    token: HashToken(rawRefreshToken),
    userId: user.id,
    expiresAt: new Date(Date.now() + constant.REFRESH_TTL_MS),
  });
  res.cookie("refresh_token", rawRefreshToken, {
    path: constant.REFRESH_TOKEN_PATH,
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: constant.REFRESH_TTL_MS,
  });
  const { password: _, ...safeUser } = user;
  return { accessToken, user: safeUser };
};

export default { HashToken, SendAuthToken };
