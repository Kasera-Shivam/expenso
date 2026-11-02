import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createExpense,
  deleteExpense,
  fetchExpenses,
  fetchExpenseSummary,
  updateExpense,
} from "@/api/expense";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";
import type {
  ExpenseFiltersSchema,
  UpdateExpenseSchema,
} from "@/validations/expense.validation";

export const useExpenseCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["expense-save"],
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
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

export const useExpenseSummary = () => {
  const now = new Date();
  const to = now.toISOString().split("T")[0];
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 30);
  const from = pastDate.toISOString().split("T")[0];
  return useQuery({
    queryKey: ["expense-summary", { from, to }],
    queryFn: () => fetchExpenseSummary({ from, to }),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useExpenseUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["expense-save"],
    mutationFn: ({ id, body }: { id: string; body: UpdateExpenseSchema }) =>
      updateExpense(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
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
      toast.success("Expense deleted successfully.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};
