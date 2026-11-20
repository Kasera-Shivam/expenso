import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import path from "path";
import dirname from "../dirname";
import fs from "node:fs";
import { customAlphabet } from "nanoid";
import { alphanumeric } from "nanoid-dictionary";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const templateCache = new Map<string, string>();

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

const ReadTemplate = (
  fileName: string,
  replacements: Record<string, string> = {},
): string => {
  let template = templateCache.get(fileName);
  if (template === undefined) {
    template = fs.readFileSync(
      path.join(dirname, "templates", fileName),
      "utf8",
    );
    templateCache.set(fileName, template);
  }
  return template.replace(/{{(\w+)}}/g, (_, key: string) =>
    escapeHtml(replacements[key] ?? ""),
  );
};

const GenerateRandomStr = ({
  length = 11,
  alphabet = alphanumeric,
}: { length?: number; alphabet?: string } = {}) => {
  const generator = customAlphabet(alphabet, length);
  return generator();
};

const HslToHex = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
};

const GenerateRandomColor = () =>
  HslToHex(Math.floor(Math.random() * 360), 70, 55);

export default {
  SendSuccess,
  ReadTemplate,
  GenerateRandomStr,
  HslToHex,
  GenerateRandomColor,
};
