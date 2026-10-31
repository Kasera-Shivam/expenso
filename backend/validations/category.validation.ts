import z from "zod";

const CreateCategorySchema = z.object({
  name: z
    .string("Category name is required.")
    .nonempty("Category name is required.")
    .max(64, "Category name cannot exeed 64 characters.")
    .trim(),

  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Invalid color.")
    .optional(),
});

const UpdateCategorySchema = CreateCategorySchema.partial();

export default { CreateCategorySchema, UpdateCategorySchema };
export type CreateCategorySchema = z.infer<typeof CreateCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof UpdateCategorySchema>;
