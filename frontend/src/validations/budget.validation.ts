import z from "zod";

const BudgetSchema = z.object({
  amount: z
    .string("Amount is required.")
    .nonempty("Amount is required.")
    .regex(/^\d{1,8}(\.\d{1,2})?$/, "Invalid amount.")
    .refine((v) => Number(v) > 0, "Amount must be greater than 0."),
});

export default { BudgetSchema };
export type BudgetSchema = z.infer<typeof BudgetSchema>;
