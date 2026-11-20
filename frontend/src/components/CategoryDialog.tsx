import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "@/@types";
import { useCategoryCreate, useCategoryUpdate } from "@/hooks/category";
import { cn } from "@/lib/utils";
import categoryValidation, {
  type CreateCategorySchema,
} from "@/validations/category.validation";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./ui/field";
import { Input } from "./ui/input";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
};

const PRESETS = [
  "#f97316",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#eab308",
  "#22c55e",
  "#ef4444",
  "#14b8a6",
];

const CategoryDialog = ({ open, onOpenChange, category }: Props) => {
  const create = useCategoryCreate();
  const update = useCategoryUpdate();
  const isPending = create.isPending || update.isPending;

  const form = useForm<CreateCategorySchema>({
    resolver: zodResolver(categoryValidation.CreateCategorySchema),
    defaultValues: {
      name: category?.name ?? "",
      color: category?.color ?? PRESETS[1],
    },
  });

  const onSubmit = (values: CreateCategorySchema) => {
    const options = { onSuccess: () => onOpenChange(false) };
    if (category) update.mutate({ id: category.id, body: values }, options);
    else create.mutate(values, options);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !isPending && onOpenChange(next)}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit category" : "Add category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel
                    htmlFor={field.name}
                    className={cn({ "text-destructive": fieldState.invalid })}
                  >
                    Name
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={field.name}
                      placeholder="Groceries"
                      maxLength={64}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                  </FieldContent>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="color"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Color</FieldLabel>
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Use ${color}`}
                        onClick={() => field.onChange(color)}
                        className={cn(
                          "size-7 rounded-full border-2 border-transparent",
                          field.value === color && "border-white",
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input
                      type="color"
                      aria-label="Pick a custom color"
                      value={field.value ?? PRESETS[1]}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    />
                  </div>
                </Field>
              )}
            />

            <Button type="submit" size="lg" loading={isPending}>
              {category ? "Save changes" : "Add category"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
