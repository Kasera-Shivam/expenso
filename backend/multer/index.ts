import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ApiError } from "../lib/error";
import { StatusCodes } from "http-status-codes";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(
      file.mimetype,
    );
    if (ok) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          "Only JPG, PNG or WebP images are allowed.",
        ),
      );
    }
  },
}).single("avatar");

export const avatarUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload(req, res, (error: unknown) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "Image must be under 2 MB."
          : error.code === "LIMIT_UNEXPECTED_FILE"
            ? 'Send the image in the "avatar" field.'
            : "Invalid upload.";
      return next(new ApiError(StatusCodes.BAD_REQUEST, message));
    }
    next(error);
  });
};
