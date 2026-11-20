import React from "react";
import { useIsMutating } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import ExpenseForm from "./ExpenseForm";

const AddExpense = ({ children }: React.PropsWithChildren) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const isSaving = useIsMutating({ mutationKey: ["expense-save"] }) > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSaving) return;
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={!isSaving}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          if (isSaving) e.preventDefault();
        }}
        className="w-sm max-w-sm"
      >
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <ExpenseForm mode="add" onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default AddExpense;
