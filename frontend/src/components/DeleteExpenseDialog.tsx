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
import { useExpenseDelete } from "@/hooks/expense"; // aapka delete hook

interface DeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseId: string;
}

export function DeleteExpenseDialog({
  open,
  onOpenChange,
  expenseId,
}: DeleteProps) {
  const { mutate: deleteExpense, isPending } = useExpenseDelete();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm rounded-xl border-zinc-800 bg-zinc-950 text-zinc-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-semibold">
            Delete Expense?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-zinc-400">
            Are you sure you want to delete this expense? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 flex-row justify-end space-x-2">
          <AlertDialogCancel
            disabled={isPending}
            className="h-8 border-zinc-800 bg-zinc-900 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() =>
              deleteExpense(expenseId, {
                onSuccess: () => onOpenChange(false),
              })
            }
            className="h-8 bg-rose-600 text-xs font-medium text-white hover:bg-rose-700"
          >
            {isPending ? "Deleting..." : "Confirm Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
