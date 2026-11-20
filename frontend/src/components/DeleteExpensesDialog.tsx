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
import { useExpensesBulkDelete } from "@/hooks/expense";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  onDeleted: () => void;
};

export function DeleteExpensesDialog({
  open,
  onOpenChange,
  ids,
  onDeleted,
}: Props) {
  const { mutate, isPending } = useExpensesBulkDelete();
  const count = ids.length;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !isPending && onOpenChange(next)}
    >
      <AlertDialogContent className="max-w-sm rounded-xl border-zinc-800 bg-zinc-950 text-zinc-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-semibold">
            Delete {count} {count === 1 ? "expense" : "expenses"}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-zinc-400">
            The selected {count === 1 ? "expense" : "expenses"} will be removed
            permanently. This action cannot be undone.
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
            onClick={(e) => {
              e.preventDefault();
              mutate(ids, {
                onSuccess: () => {
                  onOpenChange(false);
                  onDeleted();
                },
              });
            }}
            className="h-8 bg-rose-600 text-xs font-medium text-white hover:bg-rose-700"
          >
            {isPending ? "Deleting..." : `Delete ${count}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
