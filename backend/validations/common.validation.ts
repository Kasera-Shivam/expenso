import z from "zod";

const IdParams = z.object({
  id: z
    .string("Id is required.")
    .nonempty("Id is required.")
    .length(11, "Invalid Id."),
});

export default { IdParams };
export type IdParams = z.infer<typeof IdParams>;
