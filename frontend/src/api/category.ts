import type { Category } from "@/@types";
import type { CreateCategorySchema } from "@/validations/category.validation";
import { api } from ".";

export const createCategory = (body: CreateCategorySchema) =>
  api
    .post("/category/create", body)
    .then((r) => r.data.data.category as Category);

export const fetchCategories = (q?: string) =>
  api
    .get("/category/list", { params: q ? q : undefined })
    .then((r) => r.data.data.categories as Category[]);

export const updateCategory = (
  id: string,
  body: Partial<CreateCategorySchema>,
) =>
  api
    .patch(`/category/${id}/update`, body)
    .then((r) => r.data.data.category as Category);

export const deleteCategory = (id: string) =>
  api.delete(`/category/${id}/delete`).then(() => id);
