import type {
  CategoryBreakdownResponse,
  DateRange,
  Expense,
  ExpenseListItem,
  ExpenseSummaryResponse,
  ExpenseTrendResponse,
  Paginated,
} from "@/@types";
import type {
  CreateExpenseSchema,
  ExpenseFiltersSchema,
  UpdateExpenseSchema,
} from "@/validations/expense.validation";
import { api } from ".";

export const createExpense = (body: CreateExpenseSchema) =>
  api.post("/expense/create", body).then((r) => r.data.data.expense as Expense);

export const fetchExpenses = (filters: ExpenseFiltersSchema) =>
  api
    .get("/expense/list", { params: { ...filters, limit: 15 } })
    .then((r) => r.data.data as Paginated<ExpenseListItem>);

export const fetchExpenseSummary = (params?: { from?: string; to?: string }) =>
  api
    .get("/expense/summary", { params })
    .then((r) => r.data.data as ExpenseSummaryResponse);

export const fetchExpenseTrend = (range: DateRange, categoryId?: string) =>
  api
    .get("/expense/trend", { params: { ...range, categoryId } })
    .then((r) => r.data.data as ExpenseTrendResponse);

export const fetchCategoryBreakdown = (range: DateRange) =>
  api
    .get("/expense/by-category", { params: range })
    .then((r) => r.data.data as CategoryBreakdownResponse);

export const updateExpense = (id: string, body: UpdateExpenseSchema) =>
  api
    .patch(`/expense/${id}/update`, body)
    .then((r) => r.data.data.expense as Expense);

export const deleteExpense = (id: string) =>
  api.delete(`/expense/${id}/delete`).then(() => id);

export const exportExpenses = async (filters: ExpenseFiltersSchema) => {
  const { page: _page, limit: _limit, ...params } = filters;
  try {
    const res = await api.get("/expense/export", {
      params,
      responseType: "blob",
    });
    const disposition = res.headers["content-disposition"] as
      string | undefined;
    const match = disposition?.match(/filename="?([^"]+)"?/);
    const fileName = match?.[1] ?? "expenses.csv";
    const url = URL.createObjectURL(res.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (err: any) {
    if (err?.response?.data instanceof Blob) {
      const text = await err.response.data.text();
      try {
        err.response.data = JSON.parse(text);
      } catch {}
    }
    throw err;
  }
};

export const deleteExpenses = (ids: string[]) =>
  api
    .post("/expense/bulk-delete", { ids })
    .then((r) => r.data.data as { deleted: number });
