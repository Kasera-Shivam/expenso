import type { Expense } from "@/@types";
import type {
  CreateExpenseSchema,
  UpdateExpenseSchema,
} from "@/validations/expense.validation";
import { api } from ".";

export const createExpense = (body: CreateExpenseSchema) =>
  api.post("/expense/create", body).then((r) => r.data.data.expense as Expense);

export const updateExpense = (id: string, body: UpdateExpenseSchema) =>
  api
    .patch(`/expense/${id}/update`, body)
    .then((r) => r.data.data.expense as Expense);

export const deleteExpense = (id: string) =>
  api.delete(`/expense/${id}/delete`).then(() => id);
