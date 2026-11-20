import type { DateRange } from "@/@types";
import type {
  ExpenseFiltersSchema,
  UpdateExpenseSchema,
} from "@/validations/expense.validation";
import { getErrorMessage } from "@/lib/error";
import { getRange } from "@/lib/date";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createExpense,
  deleteExpense,
  deleteExpenses,
  exportExpenses,
  fetchCategoryBreakdown,
  fetchExpenses,
  fetchExpenseSummary,
  fetchExpenseTrend,
  updateExpense,
} from "@/api/expense";
import { toast } from "sonner";

export const useExpenseCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["expense-save"],
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      toast.success("Expense added successfully.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useExpenses = (filters: ExpenseFiltersSchema) =>
  useQuery({
    queryKey: ["expenses", "list", filters],
    queryFn: () => fetchExpenses(filters),
    placeholderData: keepPreviousData,
  });

export const useExpenseSummary = (options?: { from?: string; to?: string }) => {
  const defaultRange = getRange("1m");
  const from = options?.from ?? defaultRange.from;
  const to = options?.to ?? defaultRange.to;

  return useQuery({
    queryKey: ["expense-summary", { from, to }],
    queryFn: () => fetchExpenseSummary({ from, to }),
    staleTime: 1000 * 60 * 5,
  });
};

export const useExpenseTrend = (range: DateRange, categoryId?: string) =>
  useQuery({
    queryKey: ["expenses", "trend", range, categoryId],
    queryFn: () => fetchExpenseTrend(range, categoryId),
    placeholderData: keepPreviousData,
  });

export const useCategoryBreakdown = (range: DateRange) =>
  useQuery({
    queryKey: ["expenses", "by-category", range],
    queryFn: () => fetchCategoryBreakdown(range),
    placeholderData: keepPreviousData,
  });

export const useExpenseUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["expense-save"],
    mutationFn: ({ id, body }: { id: string; body: UpdateExpenseSchema }) =>
      updateExpense(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      toast.success("Expense updated successfully.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useExpenseDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      toast.success("Expense deleted successfully.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useExpenseExport = () =>
  useMutation({
    mutationFn: exportExpenses,
    onError: (error) => toast.error(getErrorMessage(error)),
  });

export const useExpensesBulkDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpenses,
    onSuccess: ({ deleted }) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      toast.success(
        `${deleted} ${deleted === 1 ? "expense" : "expenses"} deleted.`,
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};
