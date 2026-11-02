import constant from "@/constant";
import type { Category, Expense } from "@/@types";
import { useExpenseCreate, useExpenseUpdate } from "@/hooks/expense";
import { today } from "@/lib/date";
import type { CreateExpenseSchema } from "@/validations/expense.validation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import expenseValidation from "@/validations/expense.validation";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "./ui/input-group";
import { CalendarDaysIcon, IndianRupeeIcon, TypeIcon } from "lucide-react";
import { cn } from "cn";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import { useCategories } from "@/hooks/category";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./ui/combobox";
import { Button } from "./ui/button";

type Props =
  | { mode: "add"; onSuccess: () => void }
  | { mode: "edit"; expense: Expense; onSuccess: () => void };

export const toFormValues = (e: Expense): CreateExpenseSchema => ({
  title: e.title,
  amount: e.amount,
  date: e.date,
  categoryId: e.categoryId ?? null,
  paymentMethod: e.paymentMethod,
  note: e.note ?? "",
});

export const getEmptyValues = (): CreateExpenseSchema => ({
  title: "",
  amount: "",
  date: today(),
  categoryId: null,
  paymentMethod: "upi",
  note: "",
});

const ExpenseForm = (props: Props) => {
  const create = useExpenseCreate();
  const update = useExpenseUpdate();
  const { data: categories } = useCategories();

  const form = useForm<CreateExpenseSchema>({
    resolver: zodResolver(expenseValidation.CreateExpenseSchema),
    defaultValues:
      props.mode === "edit" ? toFormValues(props.expense) : getEmptyValues(),
  });

  const isPending = create.isPending || update.isPending;

  const handleSubmit = (values: CreateExpenseSchema) => {
    const body = { ...values, note: values.note?.trim() || null };
    const options = { onSuccess: props.onSuccess };
    if (props.mode === "edit") {
      update.mutate({ id: props.expense.id, body }, options);
    } else {
      create.mutate(body, options);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                className={cn({ "text-destructive": fieldState.invalid })}
              >
                Title
              </FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon
                    className={cn({ "text-destructive": fieldState.invalid })}
                  >
                    <TypeIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    type="text"
                    placeholder="Title"
                    maxLength={128}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </InputGroup>
              </FieldContent>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="amount"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                className={cn({ "text-destructive": fieldState.invalid })}
              >
                Amount
              </FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon
                    className={cn({ "text-destructive": fieldState.invalid })}
                  >
                    <IndianRupeeIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    aria-invalid={fieldState.invalid}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!constant.AMOUNT_INPUT.test(value)) return;
                      field.onChange(value);
                    }}
                  />
                </InputGroup>
              </FieldContent>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="date"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                className={cn({ "text-destructive": fieldState.invalid })}
              >
                Date
              </FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon
                    className={cn({ "text-destructive": fieldState.invalid })}
                  >
                    <CalendarDaysIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    type="date"
                    placeholder="YYYY-MM-DD"
                    max={today()}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </InputGroup>
              </FieldContent>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="categoryId"
          control={form.control}
          render={({ field, fieldState }) => {
            const selected =
              categories?.find((c) => c.id === field.value) ?? null;

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                <FieldContent>
                  <Combobox
                    items={categories}
                    value={selected}
                    onValueChange={(category) =>
                      field.onChange(category?.id ?? null)
                    }
                    itemToStringLabel={(c) => c.name}
                    itemToStringValue={(c) => c.id}
                    isItemEqualToValue={(a, b) => a.id === b.id}
                  >
                    <ComboboxInput
                      id={field.name}
                      placeholder="Select a category"
                      aria-invalid={fieldState.invalid}
                      showClear
                    />
                    <ComboboxContent className="pointer-events-auto">
                      <ComboboxEmpty>No category found.</ComboboxEmpty>
                      <ComboboxList>
                        {(c: Category) => (
                          <ComboboxItem
                            key={c.id}
                            value={c}
                            className={"cursor-pointer"}
                          >
                            <span
                              className="size-2.5 rounded-full"
                              style={{ backgroundColor: c.color }}
                            />
                            {c.name}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            );
          }}
        />

        <Controller
          name="paymentMethod"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                className={cn({ "text-destructive": fieldState.invalid })}
              >
                Payment Method
              </FieldLabel>
              <FieldContent>
                <NativeSelect
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  {...field}
                  value={field.value ?? "upi"}
                  className="h-10 w-full"
                >
                  {constant.PAYMENT_METHOD.map((pm) => (
                    <NativeSelectOption value={pm}>
                      {pm.toUpperCase()}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="note"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Note</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupTextarea
                    id={field.name}
                    placeholder="Write a note..."
                    maxLength={500}
                    aria-invalid={fieldState.invalid}
                    className="field-sizing-fixed h-24 resize-none overflow-y-auto"
                    {...field}
                    value={field.value ?? ""}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="ml-auto text-xs tabular-nums">
                      {(field.value ?? "").length}/500
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
            </Field>
          )}
        />

        <Field>
          <Button type="submit" size={"lg"} loading={isPending}>
            {props.mode === "add" ? "Add Expense" : "Save changes"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default ExpenseForm;
