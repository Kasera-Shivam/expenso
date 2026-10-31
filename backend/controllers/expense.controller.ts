import constant from "../config/constant.config";
import type { NextFunction, Request, Response } from "express";
import type {
  CreateExpenseSchema,
  ListExpensesQuery,
  UpdateExpenseSchema,
  RangeQuery,
  TrendQuery,
} from "../validations/expense.validation";
import type { IdParams } from "../validations/common.validation";
import db from "../db";
import { categories, expenses } from "../db/schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { ApiError } from "../lib/error";
import { StatusCodes } from "http-status-codes";
import utils from "../lib/utils";
import { getCategoryTotals } from "../helpers";

const toDate = (s: string) => new Date(`${s}T00:00:00Z`);
const toStr = (d: Date) => d.toISOString().slice(0, 10);

const createExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const body = req.body as CreateExpenseSchema;
    if (body.categoryId) {
      const [category] = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.id, body.categoryId),
            eq(categories.userId, userId),
          ),
        )
        .limit(1);
      if (!category)
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid category.");
    }
    const [expense] = await db
      .insert(expenses)
      .values({ ...body, userId })
      .returning();
    return utils.SendSuccess(res, {
      status: StatusCodes.CREATED,
      message: "Expense created successfully.",
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
};

const fetchExpenseList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const f = res.locals.query as ListExpensesQuery;
    const conditions = [eq(expenses.userId, userId)];
    if (f.categoryId) conditions.push(eq(expenses.categoryId, f.categoryId));
    if (f.paymentMethod)
      conditions.push(eq(expenses.paymentMethod, f.paymentMethod));
    if (f.from) conditions.push(gte(expenses.date, f.from));
    if (f.to) conditions.push(lte(expenses.date, f.to));
    if (f.minAmount) conditions.push(gte(expenses.amount, f.minAmount));
    if (f.maxAmount) conditions.push(lte(expenses.amount, f.maxAmount));
    if (f.q) {
      const esc = f.q.replace(/[\\%_]/g, "//$&");
      conditions.push(
        or(
          ilike(expenses.title, `%${esc}%`),
          ilike(expenses.note, `%${esc}%`),
        )!,
      );
    }
    const where = and(...conditions);
    const orderBy = {
      date_desc: [
        desc(expenses.date),
        desc(expenses.createdAt),
        desc(expenses.id),
      ],
      date_asc: [asc(expenses.date), asc(expenses.createdAt), asc(expenses.id)],
      amount_desc: [desc(expenses.amount), desc(expenses.id)],
      amount_asc: [asc(expenses.amount), asc(expenses.id)],
    }[f.sort];
    const [items, [countRow]] = await Promise.all([
      db
        .select({
          id: expenses.id,
          title: expenses.title,
          amount: expenses.amount,
          note: expenses.note,
          date: expenses.date,
          paymentMethod: expenses.paymentMethod,
          category: {
            id: categories.id,
            name: categories.name,
            color: categories.color,
          },
        })
        .from(expenses)
        .leftJoin(categories, eq(expenses.categoryId, categories.id))
        .where(where)
        .orderBy(...orderBy)
        .limit(f.limit)
        .offset((f.page - 1) * f.limit),
      db.select({ total: count() }).from(expenses).where(where),
    ]);
    const total = countRow?.total ?? 0;
    return utils.SendSuccess(res, {
      data: {
        items,
        page: f.page,
        limit: f.limit,
        total,
        totalPages: Math.ceil(total / f.limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const fetchExpenseDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { id } = res.locals.params as IdParams;
    const [expense] = await db
      .select({
        id: expenses.id,
        title: expenses.title,
        amount: expenses.amount,
        note: expenses.note,
        date: expenses.date,
        paymentMethod: expenses.paymentMethod,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
        },
      })
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .limit(1);
    if (!expense)
      throw new ApiError(StatusCodes.NOT_FOUND, "Expense not found.");
    return utils.SendSuccess(res, { data: { expense } });
  } catch (error) {
    next(error);
  }
};

const fetchSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { from, to } = res.locals.query as RangeQuery;
    const days =
      Math.round(
        (toDate(to).getTime() - toDate(from).getTime()) / constant.DAY,
      ) + 1;
    const prevTo = toStr(new Date(toDate(from).getTime() - constant.DAY));
    const prevFrom = toStr(
      new Date(toDate(from).getTime() - days * constant.DAY),
    );
    const totalFor = (a: string, b: string) =>
      db
        .select({
          total: sql<string | null>`sum(${expenses.amount})`,
          count: count(),
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.userId, userId),
            gte(expenses.date, a),
            lte(expenses.date, b),
          ),
        );
    const [[current], [previous], byCategory] = await Promise.all([
      totalFor(from, to),
      totalFor(prevFrom, prevTo),
      getCategoryTotals(userId, from, to),
    ]);
    const top = byCategory[0];
    return utils.SendSuccess(res, {
      data: {
        from,
        to,
        days,
        total: current?.total ?? "0",
        count: current?.count ?? 0,
        previousTotal: previous?.total ?? "0",
        topCategory: top
          ? { name: top.name, color: top.color, total: top.total }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const fetchTrend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { from, to, categoryId } = res.locals.query as TrendQuery;
    const days =
      Math.round(
        (toDate(to).getTime() - toDate(from).getTime()) / constant.DAY,
      ) + 1;
    const unit: "day" | "week" = days <= 31 ? "day" : "week";
    const unitSql = sql.raw(`'${unit}'`);
    const stepSql = sql.raw(`'1 ${unit}'::interval`);
    const categoryFilter = categoryId
      ? sql`and e.category_id = ${categoryId}`
      : sql``;
    const rows = await db.execute<{ bucket: string; total: string }>(sql`
      select to_char(b, 'YYYY-MM-DD') as bucket,
             coalesce(sum(e.amount), 0)::numeric(12,2)::text as total
      from generate_series(
             date_trunc(${unitSql}, ${from}::timestamp),
             ${to}::timestamp,
             ${stepSql}
           ) as b
      left join expenses e
        on e.user_id = ${userId}
       and e.date between ${from}::date and ${to}::date
       and date_trunc(${unitSql}, e.date::timestamp) = b
       ${categoryFilter}
      group by b
      order by b
    `);
    return utils.SendSuccess(res, {
      data: {
        from,
        to,
        unit,
        categoryId: categoryId ?? null,
        items: rows.map((r) => ({ date: r.bucket, total: r.total })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const fetchCategoryBreakdown = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { from, to } = res.locals.query as RangeQuery;
    const items = await getCategoryTotals(userId, from, to);
    return utils.SendSuccess(res, { data: { from, to, items } });
  } catch (error) {
    next(error);
  }
};

const updateExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };
    const body = req.body as UpdateExpenseSchema;
    if (body.categoryId) {
      const [category] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(
          and(
            eq(categories.id, body.categoryId),
            eq(categories.userId, userId),
          ),
        )
        .limit(1);
      if (!category)
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid category.");
    }
    const [expense] = await db
      .update(expenses)
      .set(body)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    if (!expense)
      throw new ApiError(StatusCodes.NOT_FOUND, "Expense not found.");
    return utils.SendSuccess(res, {
      message: "Expense updated successfully.",
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };
    const [deleted] = await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning({ id: expenses.id });
    if (!deleted)
      throw new ApiError(StatusCodes.NOT_FOUND, "Expense not found.");
    return utils.SendSuccess(res, { message: "Expense deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export default {
  createExpense,
  fetchExpenseList,
  fetchExpenseDetails,
  fetchSummary,
  fetchTrend,
  fetchCategoryBreakdown,
  updateExpense,
  deleteExpense,
};
