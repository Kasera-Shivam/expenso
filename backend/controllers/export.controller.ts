import type { NextFunction, Request, Response } from "express";
import type { ExportQuery } from "../validations/expense.validation";
import { ApiError } from "../lib/error";
import { StatusCodes } from "http-status-codes";
import { and, asc, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import db from "../db";
import { categories, expenses } from "../db/schema";

const cell = (value?: string | null) => {
  let v = value ?? "";
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  return `"${v.replace(/"/g, '""')}"`;
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

const buildFileName = (f: ExportQuery, categoryName?: string | null) => {
  const parts: string[] = ["expenses"];
  if (categoryName) parts.push(slugify(categoryName));
  if (f.paymentMethod) parts.push(slugify(f.paymentMethod));
  if (f.q) parts.push(`q-${slugify(f.q)}`);
  if (f.from && f.to) parts.push(`${f.from}_to_${f.to}`);
  else if (f.from) parts.push(`from_${f.from}`);
  else if (f.to) parts.push(`until_${f.to}`);
  if (f.minAmount || f.maxAmount)
    parts.push(`amt-${f.minAmount ?? 0}-${f.maxAmount ?? "max"}`);
  if (parts.length === 1) parts.push(new Date().toISOString().slice(0, 10));
  return `${parts.join("_")}.csv`;
};

const exportExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const f = res.locals.query as ExportQuery;
    const conditions = [eq(expenses.userId, userId)];
    if (f.categoryId) conditions.push(eq(expenses.categoryId, f.categoryId));
    if (f.paymentMethod)
      conditions.push(eq(expenses.paymentMethod, f.paymentMethod));
    if (f.from) conditions.push(gte(expenses.date, f.from));
    if (f.to) conditions.push(lte(expenses.date, f.to));
    if (f.minAmount) conditions.push(gte(expenses.amount, f.minAmount));
    if (f.maxAmount) conditions.push(lte(expenses.amount, f.maxAmount));
    if (f.q) {
      const esc = f.q.replace(/[\\%_]/g, "\\$&");
      conditions.push(
        or(
          ilike(expenses.title, `%${esc}%`),
          ilike(expenses.note, `%${esc}%`),
        )!,
      );
    }
    const orderBy = {
      date_desc: [desc(expenses.date), desc(expenses.id)],
      date_asc: [asc(expenses.date), asc(expenses.id)],
      amount_desc: [desc(expenses.amount), desc(expenses.id)],
      amount_asc: [asc(expenses.amount), asc(expenses.id)],
    }[f.sort];
    const rows = await db
      .select({
        date: expenses.date,
        title: expenses.title,
        amount: expenses.amount,
        category: categories.name,
        paymentMethod: expenses.paymentMethod,
        note: expenses.note,
      })
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(...orderBy)
      .limit(20000);
    if (rows.length === 0)
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "No expenses found for the selected filters.",
      );
    const categoryName = f.categoryId ? rows[0]?.category : null;
    const fileName = buildFileName(f, categoryName);
    const header = "Date,Title,Amount,Category,Payment method,Note";
    const lines = rows.map((r) =>
      [
        r.date,
        cell(r.title),
        r.amount,
        cell(r.category),
        cell(r.paymentMethod),
        cell(r.note),
      ].join(","),
    );
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send("\uFEFF" + [header, ...lines].join("\n"));
  } catch (error) {
    next(error);
  }
};

export default { exportExpenses };
