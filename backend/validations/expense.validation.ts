import z from "zod";

const DateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD.")
  .refine(
    (v) => new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v,
    "Invalid date.",
  );

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

const ListExpensesQuery = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  limit: z.coerce.number().int().positive().min(1).max(50).default(10),
  q: z.string().trim().max(64).optional(),
  categoryId: z.string().length(11).optional(),
  paymentMethod: z.enum(["cash", "upi", "card", "other"]).optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  minAmount: z
    .string()
    .regex(/^\d{1,8}(\.\d{1,2})?$/)
    .optional(),
  maxAmount: z
    .string()
    .regex(/^\d{1,8}(\.\d{1,2})?$/)
    .optional(),
  sort: z
    .enum(["date_desc", "date_asc", "amount_desc", "amount_asc"])
    .default("date_desc"),
});

const UpdateExpenseSchema = CreateExpenseSchema.partial().refine(
  (b) => Object.keys(b).length > 0,
  "Provide at least one field to update.",
);

const RangeQuery = z
  .object({
    from: DateStr,
    to: DateStr,
  })
  .refine((q) => q.from <= q.to, "from must not be after to.")
  .refine(
    (q) => (Date.parse(q.to) - Date.parse(q.from)) / 86_400_000 <= 366,
    "Range cannot exceed 366 days.",
  );

const TrendQuery = z
  .object({
    from: DateStr,
    to: DateStr,
    categoryId: z.string().length(11, "Invalid category id.").optional(),
  })
  .refine((q) => q.from <= q.to, "from must not be after to.")
  .refine(
    (q) => (Date.parse(q.to) - Date.parse(q.from)) / 86_400_000 <= 366,
    "Range cannot exceed 366 days.",
  );

export default {
  CreateExpenseSchema,
  UpdateExpenseSchema,
  ListExpensesQuery,
  RangeQuery,
  TrendQuery,
};
export type CreateExpenseSchema = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpenseSchema = z.infer<typeof UpdateExpenseSchema>;
export type ListExpensesQuery = z.infer<typeof ListExpensesQuery>;
export type RangeQuery = z.infer<typeof RangeQuery>;
export type TrendQuery = z.infer<typeof TrendQuery>;
