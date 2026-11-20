import z from "zod";

const Month = z
  .string("Month is required.")
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be YYYY-MM.");

const MonthQuery = z.object({ month: Month });

const UpsertBudgetSchema = z.object({
  month: Month,
  amount: z
    .string("Amount is required.")
    .regex(/^\d{1,8}(\.\d{1,2})?$/, "Invalid amount.")
    .refine((v) => Number(v) > 0, "Amount must be greater than 0."),
});

export default { MonthQuery, UpsertBudgetSchema };
export type MonthQuery = z.infer<typeof MonthQuery>;
export type UpsertBudgetSchema = z.infer<typeof UpsertBudgetSchema>;
