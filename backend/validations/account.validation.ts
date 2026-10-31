import z from "zod";

const UpdateAccountSchema = z
  .object({
    firstName: z
      .string("First name is required.")
      .nonempty("First name is required.")
      .max(64, "First name cannot exceed 64 characters.")
      .trim()
      .optional(),
    lastName: z
      .string()
      .max(64, "Last name cannot exceed 64 characters.")
      .trim()
      .nullable()
      .optional(),
  })
  .refine(
    (b) => Object.keys(b).length > 0,
    "Provide at least one field to update.",
  );

export default { UpdateAccountSchema };
export type UpdateAccountSchema = z.infer<typeof UpdateAccountSchema>;
