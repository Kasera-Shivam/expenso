import type { NextFunction, Request, Response } from "express";
import utils from "../lib/utils";

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

export default { fetchMyAccount };
