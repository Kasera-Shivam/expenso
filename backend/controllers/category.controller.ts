import type { NextFunction, Request, Response } from "express";
import type {
  CreateCategorySchema,
  UpdateCategorySchema,
} from "../validations/category.validation";
import type { IdParams } from "../validations/common.validation";
import { ApiError, isUniqueViolation } from "../lib/error";
import utils from "../lib/utils";
import { StatusCodes } from "http-status-codes";
import { and, asc, eq, ilike } from "drizzle-orm";
import db from "../db";
import { categories } from "../db/schema";

const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { name, color } = req.body as CreateCategorySchema;
    const [category] = await db
      .insert(categories)
      .values({
        name,
        color: color ?? utils.GenerateRandomColor(),
        userId,
      })
      .returning();
    return utils.SendSuccess(res, {
      status: StatusCodes.CREATED,
      message: "Category created successfully.",
      data: { category },
    });
  } catch (error: any) {
    if (isUniqueViolation(error))
      next(new ApiError(StatusCodes.CONFLICT, "Category already exists."));
    next(error);
  }
};

const fetchCategoryList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { q } = req.query as { q?: string };
    const escaped = q?.trim().replace(/[\\%_]/g, "\\$&");
    const rows = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.userId, userId),
          escaped ? ilike(categories.name, `%${escaped}%`) : undefined,
        ),
      )
      .orderBy(asc(categories.name));
    return utils.SendSuccess(res, { data: { categories: rows } });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { id } = res.locals.params as IdParams;
    const { name, color } = req.body as UpdateCategorySchema;
    const [category] = await db
      .update(categories)
      .set({ name, color })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    if (!category)
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found.");
    return utils.SendSuccess(res, {
      message: "Category updated successfully.",
      data: { category },
    });
  } catch (error) {
    if (isUniqueViolation(error))
      next(new ApiError(StatusCodes.CONFLICT, "Category already exists."));
    next(error);
  }
};

const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { id } = res.locals.params as IdParams;
    const [deleted] = await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning({ id: categories.id });
    if (!deleted)
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found.");
    return utils.SendSuccess(res, {
      message: "Category deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createCategory,
  fetchCategoryList,
  updateCategory,
  deleteCategory,
};
