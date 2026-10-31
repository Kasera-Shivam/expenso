import rateLimit from "express-rate-limit";
import { ApiError } from "../lib/error";
import { StatusCodes } from "http-status-codes";

const createLimiter = (windowMinutes: number, max: number, message: string) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    // tumhara central ErrorHandler hi 429 ka response banayega
    handler: (_req, _res, next) =>
      next(new ApiError(StatusCodes.TOO_MANY_REQUESTS, message)),
  });

const signupLimiter = createLimiter(
  60,
  10,
  "Too many sign-up attempts. Try again later.",
);

const loginLimiter = createLimiter(
  15,
  10,
  "Too many login attempts. Try again in 15 minutes.",
);

const passwordLimiter = createLimiter(
  15,
  5,
  "Too many requests. Try again in 15 minutes.",
);

export default { signupLimiter, loginLimiter, passwordLimiter };
