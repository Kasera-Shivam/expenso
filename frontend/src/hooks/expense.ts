import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense, deleteExpense, updateExpense } from "@/api/expense";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";
import type { UpdateExpenseSchema } from "@/validations/expense.validation";

export const useExpenseCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["expense-save"],
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense added successfully.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
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
      toast.success("Expense deleted successfully.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};
