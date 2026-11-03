import { useIsMutating } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import ExpenseForm from "./ExpenseForm";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: any;
}

const UpdateExpense = ({ open, onOpenChange, expense }: Props) => {
  const isSaving = useIsMutating({ mutationKey: ["expense-save"] }) > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSaving) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="w-sm max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <ExpenseForm
          mode="edit"
          expense={expense}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateExpense;
