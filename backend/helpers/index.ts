import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import db from "../db";
import { categories, expenses } from "../db/schema";

export const getCategoryTotals = (userId: string, from: string, to: string) =>
  db
    .select({
      categoryId: categories.id,
      name: sql<string>`coalesce(${categories.name}, 'Uncategorized')`,
      color: sql<string>`coalesce(${categories.color}, '#9ca3af')`,
      total: sql<string>`sum(${expenses.amount})`,
      count: count(),
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(
      and(
        eq(expenses.userId, userId),
        gte(expenses.date, from),
        lte(expenses.date, to),
      ),
    )
    .groupBy(categories.id, categories.name, categories.color)
    .orderBy(desc(sql`sum(${expenses.amount})`));
