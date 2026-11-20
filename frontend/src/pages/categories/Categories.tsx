import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import CategoryDialog from "@/components/CategoryDialog";
import { useCategories, useCategoryDelete } from "@/hooks/category";
import type { Category } from "@/@types";

type DialogState = { category: Category | null } | null;

const Categories = () => {
  const { data: categories, isLoading, isError } = useCategories();
  const remove = useCategoryDelete();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeftIcon className="size-4" />
            Back
          </Link>
        </Button>
        <Button onClick={() => setDialog({ category: null })}>
          <PlusIcon />
          Add Category
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight">Categories</h2>
        <p className="text-muted-foreground text-sm">
          Group your expenses. Deleting a category keeps its expenses as
          uncategorized.
        </p>
      </div>

      {isLoading ? (
        <Loader className="mt-10" />
      ) : isError ? (
        <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border p-6 text-center text-sm">
          Failed to load categories. Please try again.
        </div>
      ) : categories?.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/40 py-12">
          <TagIcon className="size-8 stroke-[1.5] opacity-40" />
          <p className="text-sm font-medium">No categories yet</p>
          <p className="text-xs text-zinc-500">
            Add one to organise your expenses
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-800/60 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/40">
          {categories?.map((category) => (
            <li key={category.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="flex-1 truncate font-medium text-zinc-200">
                {category.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${category.name}`}
                className="text-zinc-400"
                onClick={() => setDialog({ category })}
              >
                <PencilIcon className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${category.name}`}
                className="text-rose-400 hover:text-rose-300"
                onClick={() => setToDelete(category)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {dialog && (
        <CategoryDialog
          key={dialog.category?.id ?? "new"}
          open
          category={dialog.category}
          onOpenChange={(open) => !open && setDialog(null)}
        />
      )}

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent className="max-w-sm rounded-xl border-zinc-800 bg-zinc-950 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Delete "{toDelete?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-400">
              Expenses in this category will stay but become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 flex-row justify-end space-x-2">
            <AlertDialogCancel
              disabled={remove.isPending}
              className="h-8 border-zinc-800 bg-zinc-900 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={remove.isPending}
              onClick={() =>
                toDelete &&
                remove.mutate(toDelete.id, {
                  onSuccess: () => setToDelete(null),
                })
              }
              className="h-8 bg-rose-600 text-xs font-medium text-white hover:bg-rose-700"
            >
              {remove.isPending ? "Deleting..." : "Delete category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Categories;
