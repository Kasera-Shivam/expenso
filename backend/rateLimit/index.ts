import rateLimit from "express-rate-limit";
import { ApiError } from "../lib/error";
import { StatusCodes } from "http-status-codes";

const createLimiter = (windowMinutes: number, max: number, message: string) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, _res, next) =>
      next(new ApiError(StatusCodes.TOO_MANY_REQUESTS, message)),
  });

const signupLimiter = createLimiter(
  60,
  10,
  "Too many sign-up attempts. Try again later.",
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, _res, next) =>
    next(
      new ApiError(
        StatusCodes.TOO_MANY_REQUESTS,
        "Too many failed login attempts. Try again in 15 minutes.",
      ),
    ),
});

const passwordLimiter = createLimiter(
  15,
  5,
  "Too many requests. Try again in 15 minutes.",
);

const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, _res, next) =>
    next(
      new ApiError(
        StatusCodes.TOO_MANY_REQUESTS,
        "Too many failed attempts. Try again in 15 minutes.",
      ),
    ),
});

export default {
  signupLimiter,
  loginLimiter,
  passwordLimiter,
  changePasswordLimiter,
};
