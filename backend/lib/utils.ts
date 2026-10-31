import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { customAlphabet } from "nanoid";
import { alphanumeric } from "nanoid-dictionary";

const SendSuccess = (
  res: Response,
  {
    status = StatusCodes.OK,
    message,
    data,
  }: {
    status?: StatusCodes;
    message?: string;
    data?: Record<string, unknown>;
  } = {},
) => res.status(status).json({ message, data });

const GenerateRandomStr = ({
  length = 11,
  alphabet = alphanumeric,
}: { length?: number; alphabet?: string } = {}) => {
  const generator = customAlphabet(alphabet, length);
  return generator();
};

export default { SendSuccess, GenerateRandomStr };
