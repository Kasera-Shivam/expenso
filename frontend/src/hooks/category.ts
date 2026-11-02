import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/api/category";
import { getErrorMessage } from "@/lib/error";
import type { CreateCategorySchema } from "@/validations/category.validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const categoryKeys = {
  all: ["categories"] as const,
  list: (q?: string) => ["categories", "list", q ?? ""] as const,
};

export const useCategoryCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Category added.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useCategories = (q?: string) =>
  useQuery({
    queryKey: categoryKeys.list(q),
    queryFn: () => fetchCategories(q),
    staleTime: 5 * 60_000,
  });

export const useCategoryUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<CreateCategorySchema>;
    }) => updateCategory(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Category updated.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useCategoryDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Category deleted.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};
