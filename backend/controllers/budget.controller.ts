import type { NextFunction, Request, Response } from "express";
import type {
  MonthQuery,
  UpsertBudgetSchema,
} from "../validations/budget.validation";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import db from "../db";
import { budgets, expenses } from "../db/schema";
import { ApiError } from "../lib/error";
import utils from "../lib/utils";

const monthRange = (month: string) => {
  const [y, m] = month.split("-").map(Number) as [number, number];
  const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  return { from: `${month}-01`, to: last };
};

const fetchBudget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { month } = res.locals.query as MonthQuery;
    const { from, to } = monthRange(month);
    const [[budget], [spent]] = await Promise.all([
      db
        .select({ amount: budgets.amount })
        .from(budgets)
        .where(and(eq(budgets.userId, userId), eq(budgets.month, month)))
        .limit(1),
      db
        .select({ total: sql<string | null>`sum(${expenses.amount})` })
        .from(expenses)
        .where(
          and(
            eq(expenses.userId, userId),
            gte(expenses.date, from),
            lte(expenses.date, to),
          ),
        ),
    ]);
    return utils.SendSuccess(res, {
      data: {
        month,
        amount: budget?.amount ?? null,
        spent: spent?.total ?? "0",
      },
    });
  } catch (error) {
    next(error);
  }
};

const upsertBudget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { month, amount } = req.body as UpsertBudgetSchema;
    const [budget] = await db
      .insert(budgets)
      .values({ userId, month, amount })
      .onConflictDoUpdate({
        target: [budgets.userId, budgets.month],
        set: { amount, updatedAt: new Date() },
      })
      .returning({ month: budgets.month, amount: budgets.amount });
    return utils.SendSuccess(res, {
      message: "Budget saved.",
      data: { budget },
    });
  } catch (error) {
    next(error);
  }
};

const deleteBudget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { month } = res.locals.query as MonthQuery;
    const [deleted] = await db
      .delete(budgets)
      .where(and(eq(budgets.userId, userId), eq(budgets.month, month)))
      .returning({ id: budgets.id });
    if (!deleted) throw new ApiError(StatusCodes.NOT_FOUND, "Budget not found.");
    return utils.SendSuccess(res, { message: "Budget removed." });
  } catch (error) {
    next(error);
  }
};

export default { fetchBudget, upsertBudget, deleteBudget };
