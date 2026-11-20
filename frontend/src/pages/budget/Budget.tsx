import { useState } from "react";
import { Link } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, IndianRupeeIcon } from "lucide-react";
import budgetValidation, {
  type BudgetSchema,
} from "@/validations/budget.validation";
import { useBudget, useBudgetRemove, useBudgetSave } from "@/hooks/budget";
import { monthKey } from "@/lib/date";
import { cn, formatINR } from "@/lib/utils";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import constant from "@/constant";

const BudgetForm = ({
  month,
  saved,
}: {
  month: string;
  saved: string | null;
}) => {
  const save = useBudgetSave();
  const remove = useBudgetRemove();
  const form = useForm<BudgetSchema>({
    resolver: zodResolver(budgetValidation.BudgetSchema),
    defaultValues: { amount: saved ? String(Number(saved)) : "" },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={form.handleSubmit(({ amount }) =>
        save.mutate({ month, amount }),
      )}
    >
      <Controller
        name="amount"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel
              htmlFor={field.name}
              className={cn({ "text-destructive": fieldState.invalid })}
            >
              Budget for this month
            </FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupAddon>
                  <IndianRupeeIcon />
                </InputGroupAddon>
                <InputGroupInput
                  id={field.name}
                  inputMode="decimal"
                  placeholder="20000"
                  aria-invalid={fieldState.invalid}
                  {...field}
                  onChange={(e) => {
                    if (constant.AMOUNT_INPUT.test(e.target.value))
                      field.onChange(e);
                  }}
                />
              </InputGroup>
            </FieldContent>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className="flex gap-2">
        <Button type="submit" loading={save.isPending}>
          Save budget
        </Button>
        {saved && (
          <Button
            type="button"
            variant="destructive"
            loading={remove.isPending}
            onClick={() => remove.mutate(month)}
          >
            Remove
          </Button>
        )}
      </div>
    </form>
  );
};

const Budget = () => {
  const [month, setMonth] = useState(monthKey());
  const { data, isLoading, isError } = useBudget(month);

  const budget = Number(data?.amount ?? 0);
  const spent = Number(data?.spent ?? 0);
  const percent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const isOver = budget > 0 && spent > budget;
  const label = new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-5">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeftIcon className="size-4" />
            Back
          </Link>
        </Button>
        <Input
          type="month"
          aria-label="Month"
          className="w-44"
          value={month}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
        {isLoading ? (
          <Loader className="mt-4" />
        ) : isError ? (
          <p className="text-destructive text-sm">
            Failed to load the budget. Please try again.
          </p>
        ) : data?.amount ? (
          <div className="space-y-3">
            <p className="text-xs font-medium text-zinc-400">{label}</p>
            <p className="text-3xl font-bold tracking-tight text-zinc-100 tabular-nums">
              {formatINR(spent)}
              <span className="ml-2 text-base font-normal text-zinc-500">
                of {formatINR(budget)}
              </span>
            </p>
            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={cn(
                  "h-full rounded-full transition-[width]",
                  isOver
                    ? "bg-rose-500"
                    : percent > 80
                      ? "bg-amber-500"
                      : "bg-emerald-500",
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
            <p
              className={cn(
                "text-xs",
                isOver ? "font-medium text-rose-400" : "text-zinc-500",
              )}
            >
              {isOver
                ? `${formatINR(spent - budget)} over budget`
                : `${formatINR(budget - spent)} left`}
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-400">
            No budget for {label}. Set an amount below to start tracking.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-5">
        <BudgetForm
          key={`${month}-${data?.amount ?? "none"}`}
          month={month}
          saved={data?.amount ?? null}
        />
      </div>
    </div>
  );
};

export default Budget;
