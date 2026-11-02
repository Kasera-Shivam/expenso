import React, { useState } from "react";
import { useExpenses, useExpenseSummary } from "@/hooks/expense";
import { useCategories } from "@/hooks/category";
import expenseValidation, {
  type ExpenseFiltersSchema,
} from "@/validations/expense.validation";
import { useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChartNoAxesColumnIcon,
  FilterIcon,
  SearchIcon,
  RotateCcwIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  WalletIcon,
  ReceiptIcon,
  TagIcon,
  Loader2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import ExpenseTable from "@/components/ExpenseTable";

const PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "UPI", value: "upi" },
  { label: "Card", value: "card" },
  { label: "Other", value: "other" },
] as const;

const Home = () => {
  const [params, setParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { data: categories } = useCategories();

  // Summary hook for the 3 Metric Cards (Last 30 days)
  const { data: summary, isLoading: isSummaryLoading } = useExpenseSummary();

  const parsed = expenseValidation.ExpenseFiltersSchema.safeParse(
    Object.fromEntries(params),
  );
  const filters = parsed.success
    ? parsed.data
    : expenseValidation.ExpenseFiltersSchema.parse({});

  const { data, isLoading, isError } = useExpenses(filters);

  // Summary values & trends
  const currentTotal = Number(summary?.total ?? 0);
  const prevTotal = Number(summary?.previousTotal ?? 0);
  const percentChange =
    prevTotal > 0
      ? (((currentTotal - prevTotal) / prevTotal) * 100).toFixed(1)
      : null;
  const isIncreased = Number(percentChange) > 0;

  const updateFilters = React.useCallback(
    (patch: Partial<ExpenseFiltersSchema>) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(patch)) {
          if (value === undefined || value === "") next.delete(key);
          else next.set(key, String(value));
        }
        if (!("page" in patch)) next.delete("page");
        if (next.get("page") === "1") next.delete("page");
        return next;
      });
    },
    [setParams],
  );

  const activeFilterCount = [
    filters.categoryId,
    filters.paymentMethod,
    filters.from,
    filters.to,
    filters.minAmount,
    filters.maxAmount,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    updateFilters({
      categoryId: undefined,
      paymentMethod: undefined,
      from: undefined,
      to: undefined,
      minAmount: undefined,
      maxAmount: undefined,
    });
  };

  const totalPages = data?.totalPages ?? 1;

  React.useEffect(() => {
    if (data && data.totalPages > 0 && filters.page > data.totalPages) {
      updateFilters({ page: data.totalPages });
    }
  }, [data, filters.page, updateFilters]);

  return (
    <div className="flex w-full flex-col pb-10">
      {/* Top Metric Cards (Last 30 Days Summary) */}
      <div className="flex w-full scrollbar-none gap-4 overflow-x-auto px-5 pb-4">
        {/* Card 1: Total Spend */}
        <div className="flex min-w-65 flex-1 shrink-0 flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-md transition-all hover:border-zinc-700/80 sm:shrink">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              Total Spent
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-800/70 text-zinc-400">
              <WalletIcon className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            {isSummaryLoading ? (
              <div className="flex h-12 items-center">
                <Loader2Icon className="size-5 animate-spin text-zinc-500" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold tracking-tight text-zinc-100 tabular-nums">
                  ₹
                  {currentTotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  {percentChange !== null ? (
                    <span
                      className={`inline-flex items-center font-medium ${
                        isIncreased ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {isIncreased ? (
                        <TrendingUpIcon className="mr-0.5 size-3.5" />
                      ) : (
                        <TrendingDownIcon className="mr-0.5 size-3.5" />
                      )}
                      {Math.abs(Number(percentChange))}%
                    </span>
                  ) : null}
                  <span className="text-zinc-500">
                    vs previous {summary?.days ?? 30} days
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Transactions Count */}
        <div className="flex min-w-65 flex-1 shrink-0 flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-md transition-all hover:border-zinc-700/80 sm:shrink">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Expenses</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-800/70 text-zinc-400">
              <ReceiptIcon className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            {isSummaryLoading ? (
              <div className="flex h-12 items-center">
                <Loader2Icon className="size-5 animate-spin text-zinc-500" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold tracking-tight text-zinc-100 tabular-nums">
                  {summary?.count ?? 0}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  Recorded in last {summary?.days ?? 30} days
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Top Category */}
        <div className="flex min-w-65 flex-1 shrink-0 flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-md transition-all hover:border-zinc-700/80 sm:shrink">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              Top Category
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-800/70 text-zinc-400">
              <TagIcon className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            {isSummaryLoading ? (
              <div className="flex h-12 items-center">
                <Loader2Icon className="size-5 animate-spin text-zinc-500" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{
                      backgroundColor: summary?.topCategory?.color ?? "#10b981",
                    }}
                  />
                  <span className="truncate text-lg font-bold tracking-tight text-zinc-100">
                    {summary?.topCategory?.name ?? "No Expenses"}
                  </span>
                </div>
                <div className="mt-1 text-xs text-zinc-500 tabular-nums">
                  ₹
                  {Number(summary?.topCategory?.total ?? 0).toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )}{" "}
                  spent in last {summary?.days ?? 30} days
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Unified Sticky Search, Filter & Pagination Container */}
      <div className="bg-background/95 sticky top-0 z-20 border-b border-zinc-800/50 py-3 backdrop-blur-md">
        <div className="px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Bar */}
            <div className="w-full flex-1">
              <InputGroup className="border-zinc-800 bg-zinc-900/50 focus-within:border-zinc-700">
                <InputGroupAddon>
                  <SearchIcon className="size-4 text-zinc-400" />
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  className="text-zinc-200 placeholder:text-zinc-500"
                  placeholder="Search your expense..."
                  defaultValue={filters.q ?? ""}
                  onChange={(e) => updateFilters({ q: e.target.value })}
                />
              </InputGroup>
            </div>

            {/* Actions: Filters + Chart + Sticky Pagination */}
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <div className="flex items-center space-x-2">
                {/* Filter Popover */}
                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={activeFilterCount > 0 ? "default" : "outline"}
                      size="lg"
                      className="text-muted-foreground relative gap-2 border-zinc-800 bg-zinc-900/60 px-3.5 hover:bg-zinc-800"
                    >
                      <FilterIcon className="size-4" />
                      <span className="text-xs font-medium">Filters</span>
                      {activeFilterCount > 0 && (
                        <span className="bg-primary-foreground text-primary ml-1 flex size-4 items-center justify-center rounded-full text-[10px] font-bold">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    align="end"
                    className="w-[calc(100vw-2.5rem)] rounded-xl border-zinc-800 bg-zinc-950 p-4 shadow-2xl sm:w-96"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                        <h4 className="text-sm font-medium text-zinc-200">
                          Filter Expenses
                        </h4>
                        {activeFilterCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="h-7 text-xs text-zinc-400 hover:text-zinc-100"
                          >
                            <RotateCcwIcon className="mr-1 size-3" />
                            Reset
                          </Button>
                        )}
                      </div>

                      <div className="space-y-3.5">
                        {/* Category */}
                        <div className="space-y-1">
                          <Label className="text-xs text-zinc-400">
                            Category
                          </Label>
                          <Select
                            value={filters.categoryId ?? "all"}
                            onValueChange={(val) =>
                              updateFilters({
                                categoryId: val === "all" ? undefined : val,
                              })
                            }
                          >
                            <SelectTrigger className="h-9 w-full border-zinc-800 bg-zinc-900/60 text-xs">
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent className="border-zinc-800 bg-zinc-950">
                              <SelectItem value="all">
                                All Categories
                              </SelectItem>
                              {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-1">
                          <Label className="text-xs text-zinc-400">
                            Payment Method
                          </Label>
                          <Select
                            value={filters.paymentMethod ?? "all"}
                            onValueChange={(val) =>
                              updateFilters({
                                paymentMethod:
                                  val === "all"
                                    ? undefined
                                    : (val as ExpenseFiltersSchema["paymentMethod"]),
                              })
                            }
                          >
                            <SelectTrigger className="h-9 w-full border-zinc-800 bg-zinc-900/60 text-xs">
                              <SelectValue placeholder="All Methods" />
                            </SelectTrigger>
                            <SelectContent className="border-zinc-800 bg-zinc-950">
                              <SelectItem value="all">All Methods</SelectItem>
                              {PAYMENT_METHODS.map((method) => (
                                <SelectItem
                                  key={method.value}
                                  value={method.value}
                                >
                                  {method.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Date Range */}
                        <div className="space-y-1">
                          <Label className="text-xs text-zinc-400">
                            Date Range
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="date"
                              className="h-9 border-zinc-800 bg-zinc-900/60 text-xs"
                              value={filters.from ?? ""}
                              onChange={(e) =>
                                updateFilters({ from: e.target.value })
                              }
                            />
                            <Input
                              type="date"
                              className="h-9 border-zinc-800 bg-zinc-900/60 text-xs"
                              value={filters.to ?? ""}
                              onChange={(e) =>
                                updateFilters({ to: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        {/* Amount Range */}
                        <div className="space-y-1">
                          <Label className="text-xs text-zinc-400">
                            Amount (₹ Min - Max)
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              className="h-9 border-zinc-800 bg-zinc-900/60 text-xs"
                              value={filters.minAmount ?? ""}
                              onChange={(e) =>
                                updateFilters({ minAmount: e.target.value })
                              }
                            />
                            <Input
                              type="number"
                              placeholder="Max"
                              className="h-9 border-zinc-800 bg-zinc-900/60 text-xs"
                              value={filters.maxAmount ?? ""}
                              onChange={(e) =>
                                updateFilters({ maxAmount: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Analytics Button */}
                <Button
                  variant="outline"
                  size="lg"
                  className="text-muted-foreground border-zinc-800 bg-zinc-900/60 px-3 hover:bg-zinc-800"
                >
                  <ChartNoAxesColumnIcon className="size-4" />
                  Chart
                </Button>
              </div>

              {/* Divider for screens */}
              <div className="hidden h-5 w-px bg-zinc-800 sm:block" />

              {/* Sticky Pagination Controls */}
              <div className="flex items-center space-x-2">
                <span className="hidden text-xs text-zinc-400 md:inline">
                  {filters.page} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="icon-lg"
                  className="size-9 border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
                  onClick={() => updateFilters({ page: filters.page - 1 })}
                  disabled={filters.page <= 1}
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon-lg"
                  className="size-9 border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
                  onClick={() => updateFilters({ page: filters.page + 1 })}
                  disabled={filters.page >= totalPages}
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="px-5 pt-4">
        <ExpenseTable
          data={data?.items ?? []}
          isLoading={isLoading}
          isError={isError}
          page={filters.page}
          totalPages={data?.totalPages ?? 1}
          onPageChange={(page) => updateFilters({ page })}
          sort={filters.sort}
          onSortChange={(sort) => updateFilters({ sort })}
          onEdit={(expense) => {
            console.log("Edit:", expense);
          }}
          onDelete={(expense) => {
            console.log("Delete:", expense);
          }}
        />
      </div>
    </div>
  );
};

export default Home;
