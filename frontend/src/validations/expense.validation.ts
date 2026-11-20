import z from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const amount = z.string().regex(/^\d{1,8}(\.\d{1,2})?$/);

const CreateExpenseSchema = z.object({
  title: z
    .string("Title is required.")
    .trim()
    .nonempty("Title is required.")
    .max(128, "Title cannot exceed 128 characters."),
  amount: z
    .string("Amount is required.")
    .nonempty("Amount is required.")
    .regex(/^\d{1,8}(\.\d{1,2})?$/, "Invalid amount.")
    .refine((v) => Number(v) > 0, "Amount must be greater than 0."),
  date: z
    .string("Date is required.")
    .nonempty("Date is required.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD.")
    .refine(
      (v) => new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v,
      "Invalid date.",
    ),
  note: z
    .string()
    .max(500, "Note cannot exceed 500 characters.")
    .nullable()
    .optional(),
  categoryId: z
    .string("Category id is required.")
    .length(11, "Invalid category id.")
    .nullable()
    .optional(),
  paymentMethod: z.enum(["cash", "upi", "card", "other"]).optional(),
});

const ExpenseFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(50).catch(10),
  q: z.string().trim().max(64).optional().catch(undefined),
  categoryId: z.string().length(11).optional().catch(undefined),
  paymentMethod: z
    .enum(["cash", "upi", "card", "other"])
    .optional()
    .catch(undefined),
  from: date.optional().catch(undefined),
  to: date.optional().catch(undefined),
  minAmount: amount.optional().catch(undefined),
  maxAmount: amount.optional().catch(undefined),
  sort: z
    .enum(["date_desc", "date_asc", "amount_desc", "amount_asc"])
    .catch("date_desc"),
});

const UpdateExpenseSchema = CreateExpenseSchema.partial().refine(
  (b) => Object.keys(b).length > 0,
  "Provide at least one field to update.",
);

export default {
  CreateExpenseSchema,
  ExpenseFiltersSchema,
  UpdateExpenseSchema,
};
export type CreateExpenseSchema = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpenseSchema = z.infer<typeof UpdateExpenseSchema>;
export type ExpenseFiltersSchema = z.infer<typeof ExpenseFiltersSchema>;
