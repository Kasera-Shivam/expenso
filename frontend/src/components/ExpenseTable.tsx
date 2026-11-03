import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loader from "@/components/Loader";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ReceiptTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import UpdateExpense from "./UpdateExpense";
import { DeleteExpenseDialog } from "./DeleteExpenseDialog";

export type SortValue = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

interface ExpenseTableProps {
  data: any[];
  isLoading: boolean;
  isError: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  sort?: SortValue;
  onSortChange: (sort: SortValue) => void;
  onDelete?: (expense: any) => void;
}

export default function ExpenseTable({
  data,
  isLoading,
  isError,
  page,
  totalPages,
  onPageChange,
  sort,
  onSortChange,
  onDelete,
}: ExpenseTableProps) {
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null,
  );

  const handleSort = (column: "date" | "amount") => {
    if (column === "date") {
      const nextSort = sort === "date_desc" ? "date_asc" : "date_desc";
      onSortChange(nextSort);
    } else if (column === "amount") {
      const nextSort = sort === "amount_desc" ? "amount_asc" : "amount_desc";
      onSortChange(nextSort);
    }
  };

  const renderSortIcon = (column: "date" | "amount") => {
    const isCurrent =
      (column === "date" && (sort === "date_asc" || sort === "date_desc")) ||
      (column === "amount" &&
        (sort === "amount_asc" || sort === "amount_desc"));

    if (column === "date") {
      if (sort === "date_asc")
        return <ArrowUp className="text-primary ml-1.5 size-3.5" />;
      if (sort === "date_desc")
        return <ArrowDown className="text-primary ml-1.5 size-3.5" />;
    }
    if (column === "amount") {
      if (sort === "amount_asc")
        return <ArrowUp className="text-primary ml-1.5 size-3.5" />;
      if (sort === "amount_desc")
        return <ArrowDown className="text-primary ml-1.5 size-3.5" />;
    }

    return (
      <ArrowUpDown
        className={`ml-1.5 size-3.5 transition-opacity ${
          isCurrent ? "opacity-100" : "opacity-30 group-hover:opacity-70"
        }`}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40">
        <Loader />
        <span className="text-muted-foreground animate-pulse text-xs">
          Loading expenses...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-destructive/20 bg-destructive/5 text-destructive flex h-44 flex-col items-center justify-center rounded-xl border text-sm">
        Failed to load expenses. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Table Header Controls (Top Bar Pagination) */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs text-zinc-500">
          Showing page{" "}
          <span className="font-semibold text-zinc-300">{page}</span> of{" "}
          <span className="font-semibold text-zinc-300">{totalPages}</span>
        </div>

        {/* Top Right Pagination Buttons */}
        <div className="flex items-center space-x-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-zinc-800 bg-zinc-900/60 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeftIcon className="mr-1 size-3.5" />
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 border-zinc-800 bg-zinc-900/60 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRightIcon className="ml-1 size-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/40 shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800/80 hover:bg-transparent">
              <TableHead className="w-[35%] text-xs font-medium tracking-wider text-zinc-400 uppercase">
                Title
              </TableHead>
              <TableHead className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
                Category
              </TableHead>

              {/* Date Header */}
              <TableHead
                className="group cursor-pointer text-xs font-medium tracking-wider text-zinc-400 uppercase transition-colors select-none hover:text-zinc-100"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  <span>Date</span>
                  {renderSortIcon("date")}
                </div>
              </TableHead>

              {/* Amount Header */}
              <TableHead
                className="group cursor-pointer text-right text-xs font-medium tracking-wider text-zinc-400 uppercase transition-colors select-none hover:text-zinc-100"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  <span>Amount</span>
                  {renderSortIcon("amount")}
                </div>
              </TableHead>

              {/* Actions Header */}
              <TableHead className="w-12 text-center text-xs font-medium tracking-wider text-zinc-400 uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={5} className="h-44 text-center">
                  <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <ReceiptTextIcon className="size-8 stroke-[1.5] opacity-40" />
                    <p className="text-sm font-medium">No expenses found</p>
                    <p className="text-xs text-zinc-500">
                      Try resetting your filters or search keywords
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-zinc-800/60 transition-colors hover:bg-zinc-900/40"
                >
                  <TableCell className="max-w-40 font-medium text-zinc-200">
                    <span className="block truncate" title={item.title}>
                      {item.title}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.category ? (
                      <Badge
                        variant="secondary"
                        className="inline-flex items-center gap-1.5 border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-xs font-normal text-zinc-300"
                      >
                        {item.category.color && (
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: item.category.color }}
                          />
                        )}
                        {item.category.name}
                      </Badge>
                    ) : (
                      <span className="text-xs text-zinc-500">
                        Uncategorized
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-400">
                    {new Date(item.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium text-zinc-100 tabular-nums">
                    ₹
                    {Number(item.amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200"
                        >
                          <MoreHorizontalIcon className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-36 rounded-lg border-zinc-800 bg-zinc-950 text-zinc-200 shadow-xl"
                      >
                        <DropdownMenuItem
                          onClick={() =>
                            setEditingExpense({
                              ...item,
                              categoryId: item.category?.id ?? null,
                            })
                          }
                          className="cursor-pointer gap-2 text-xs focus:bg-zinc-900 focus:text-zinc-100"
                        >
                          <PencilIcon className="size-3.5 text-zinc-400" />
                          <span>Edit</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-zinc-800/80" />

                        <DropdownMenuItem
                          onClick={() => {
                            if (onDelete) onDelete(item);
                            else setDeletingExpenseId(item.id);
                          }}
                          className="cursor-pointer gap-2 text-xs text-rose-400 focus:bg-rose-500/10 focus:text-rose-300"
                        >
                          <Trash2Icon className="size-3.5" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog (Outside Dropdown) */}
      {editingExpense && (
        <UpdateExpense
          open={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
          expense={editingExpense}
        />
      )}

      {/* Delete Confirmation Alert (Outside Dropdown) */}
      {deletingExpenseId && (
        <DeleteExpenseDialog
          open={!!deletingExpenseId}
          onOpenChange={(open) => !open && setDeletingExpenseId(null)}
          expenseId={deletingExpenseId}
        />
      )}
    </div>
  );
}
