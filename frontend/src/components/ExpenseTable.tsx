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
import { Checkbox } from "@/components/ui/checkbox";
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
import type { ExpenseListItem } from "@/@types";
import { formatDate } from "@/lib/date";
import { formatINR } from "@/lib/utils";
import UpdateExpense from "./UpdateExpense";
import { DeleteExpenseDialog } from "./DeleteExpenseDialog";
import { DeleteExpensesDialog } from "./DeleteExpensesDialog";
import Pagination from "./Pagination";

export type SortValue = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
type Column = "date" | "amount";

interface ExpenseTableProps {
  data: ExpenseListItem[];
  isLoading: boolean;
  isError: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  sort?: SortValue;
  onSortChange: (sort: SortValue) => void;
}

const CategoryBadge = ({ item }: { item: ExpenseListItem }) =>
  item.category ? (
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
    <span className="text-xs text-zinc-500">Uncategorized</span>
  );

const RowMenu = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => (
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
        onClick={onEdit}
        className="cursor-pointer gap-2 text-xs focus:bg-zinc-900 focus:text-zinc-100"
      >
        <PencilIcon className="size-3.5 text-zinc-400" />
        <span>Edit</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator className="bg-zinc-800/80" />
      <DropdownMenuItem
        onClick={onDelete}
        className="cursor-pointer gap-2 text-xs text-rose-400 focus:bg-rose-500/10 focus:text-rose-300"
      >
        <Trash2Icon className="size-3.5" />
        <span>Delete</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default function ExpenseTable({
  data,
  isLoading,
  isError,
  page,
  totalPages,
  onPageChange,
  sort,
  onSortChange,
}: ExpenseTableProps) {
  const [editing, setEditing] = useState<
    (ExpenseListItem & { categoryId: string | null }) | null
  >(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);

  const selectedIds = data.filter((i) => selected.has(i.id)).map((i) => i.id);
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleOne = (id: string, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const toggleAll = (checked: boolean) =>
    setSelected(checked ? new Set(data.map((i) => i.id)) : new Set());

  const changePage = (next: number) => {
    setSelected(new Set());
    onPageChange(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onBulkDeleted = () => {
    if (selectedIds.length === data.length && page > 1) onPageChange(page - 1);
    setSelected(new Set());
  };

  const handleSort = (column: Column) =>
    onSortChange(
      sort === `${column}_desc` ? `${column}_asc` : `${column}_desc`,
    );

  const sortIcon = (column: Column) => {
    if (sort === `${column}_asc`)
      return <ArrowUp className="text-primary ml-1.5 size-3.5" />;
    if (sort === `${column}_desc`)
      return <ArrowDown className="text-primary ml-1.5 size-3.5" />;
    return (
      <ArrowUpDown className="ml-1.5 size-3.5 opacity-30 transition-opacity group-hover:opacity-70" />
    );
  };

  const edit = (item: ExpenseListItem) =>
    setEditing({ ...item, categoryId: item.category?.id ?? null });

  if (isLoading) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40">
        <Loader className="mt-0" label="Loading expenses..." />
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

  const empty = (
    <div className="text-muted-foreground flex h-44 flex-col items-center justify-center gap-2">
      <ReceiptTextIcon className="size-8 stroke-[1.5] opacity-40" />
      <p className="text-sm font-medium">No expenses found</p>
      <p className="text-xs text-zinc-500">
        Try resetting your filters or search keywords
      </p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="text-xs text-zinc-500">
          Showing page{" "}
          <span className="font-semibold text-zinc-300">{page}</span> of{" "}
          <span className="font-semibold text-zinc-300">{totalPages}</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-zinc-800 bg-zinc-900/60 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
            onClick={() => changePage(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeftIcon className="mr-1 size-3.5" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-zinc-800 bg-zinc-900/60 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
            onClick={() => changePage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRightIcon className="ml-1 size-3.5" />
          </Button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2">
          <span className="text-sm text-zinc-300">
            <span className="font-semibold">{selectedIds.length}</span> selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkOpen(true)}
            >
              <Trash2Icon className="size-3.5" />
              Delete selected
            </Button>
          </div>
        </div>
      )}

      <div className="hidden overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/40 shadow-sm md:block">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800/80 hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Select all expenses on this page"
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={(value) => toggleAll(value === true)}
                />
              </TableHead>
              <TableHead className="w-[35%] text-xs font-medium tracking-wider text-zinc-400 uppercase">
                Title
              </TableHead>
              <TableHead className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
                Category
              </TableHead>
              <TableHead
                className="group cursor-pointer text-xs font-medium tracking-wider text-zinc-400 uppercase transition-colors select-none hover:text-zinc-100"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  <span>Date</span>
                  {sortIcon("date")}
                </div>
              </TableHead>
              <TableHead
                className="group cursor-pointer text-right text-xs font-medium tracking-wider text-zinc-400 uppercase transition-colors select-none hover:text-zinc-100"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  <span>Amount</span>
                  {sortIcon("amount")}
                </div>
              </TableHead>
              <TableHead className="w-12 text-center text-xs font-medium tracking-wider text-zinc-400 uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={6}>{empty}</TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={item.id}
                  data-state={selected.has(item.id) ? "selected" : undefined}
                  className="border-zinc-800/60 transition-colors hover:bg-zinc-900/40 data-[state=selected]:bg-zinc-900/70"
                >
                  <TableCell>
                    <Checkbox
                      aria-label={`Select ${item.title}`}
                      checked={selected.has(item.id)}
                      onCheckedChange={(value) =>
                        toggleOne(item.id, value === true)
                      }
                    />
                  </TableCell>
                  <TableCell className="max-w-40 font-medium text-zinc-200">
                    <span className="block truncate" title={item.title}>
                      {item.title}
                    </span>
                  </TableCell>
                  <TableCell>
                    <CategoryBadge item={item} />
                  </TableCell>
                  <TableCell className="text-sm text-zinc-400">
                    {formatDate(item.date)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-zinc-100 tabular-nums">
                    {formatINR(item.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <RowMenu
                      onEdit={() => edit(item)}
                      onDelete={() => setDeletingId(item.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2 md:hidden">
        <div className="flex items-center gap-2 px-1 text-xs text-zinc-500">
          <Checkbox
            aria-label="Select all expenses on this page"
            checked={
              allSelected ? true : someSelected ? "indeterminate" : false
            }
            onCheckedChange={(value) => toggleAll(value === true)}
          />
          <span>Sort by</span>
          {(["date", "amount"] as const).map((column) => (
            <Button
              key={column}
              variant="outline"
              size="sm"
              className="h-7 border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300 capitalize"
              onClick={() => handleSort(column)}
            >
              {column}
              {sortIcon(column)}
            </Button>
          ))}
        </div>

        {data.length === 0 ? (
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40">
            {empty}
          </div>
        ) : (
          data.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3 data-[state=selected]:bg-zinc-900/70"
              data-state={selected.has(item.id) ? "selected" : undefined}
            >
              <Checkbox
                className="mt-1"
                aria-label={`Select ${item.title}`}
                checked={selected.has(item.id)}
                onCheckedChange={(value) => toggleOne(item.id, value === true)}
              />
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="truncate font-medium text-zinc-200">
                  {item.title}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge item={item} />
                  <span className="text-xs text-zinc-500 uppercase">
                    {item.paymentMethod}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">{formatDate(item.date)}</p>
              </div>
              <p className="font-semibold text-zinc-100 tabular-nums">
                {formatINR(item.amount)}
              </p>
              <RowMenu
                onEdit={() => edit(item)}
                onDelete={() => setDeletingId(item.id)}
              />
            </div>
          ))
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={changePage}
      />

      <DeleteExpensesDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        ids={selectedIds}
        onDeleted={onBulkDeleted}
      />

      {editing && (
        <UpdateExpense
          open
          onOpenChange={(open) => !open && setEditing(null)}
          expense={editing}
        />
      )}

      {deletingId && (
        <DeleteExpenseDialog
          open
          onOpenChange={(open) => !open && setDeletingId(null)}
          expenseId={deletingId}
        />
      )}
    </div>
  );
}
