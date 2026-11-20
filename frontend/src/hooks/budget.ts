import { fetchBudget, removeBudget, saveBudget } from "@/api/budget";
import { getErrorMessage } from "@/lib/error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBudget = (month: string) =>
  useQuery({ queryKey: ["budget", month], queryFn: () => fetchBudget(month) });

export const useBudgetSave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      toast.success("Budget saved.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useBudgetRemove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      toast.success("Budget removed.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};
