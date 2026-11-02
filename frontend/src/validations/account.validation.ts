import z from "zod";

const CreateAccountSchema = z.object(
  {
    firstName: z
      .string("Firstname is required.")
      .nonempty("Firstname is required.")
      .max(64, "Firstname cannot exceed 64 characters."),
    lastName: z
      .string()
      .max(64, "Lastname cannot exceed 64 characters.")
      .optional(),
    email: z
      .email({
        error: (err) => {
          if (!err.input) return "Email is required.";
          if (err.code === "invalid_format") return "Invalid email id.";
        },
      })
      .nonempty("Email is required.")
      .max(256, "Email cannot exceed 256 characters.")
      .trim()
      .toLowerCase(),
    password: z
      .string("Password is required.")
      .nonempty("Password is required.")
      .min(8, "Password must be atleast 8 characters long."),
  },
  "Request body is required.",
);

const LoginSchema = z.object({
  email: z
    .email({
      error: (err) => {
        if (!err.input) return "Email is required.";
        if (err.code === "invalid_format") return "Invalid email id.";
      },
    })
    .nonempty("Email is required.")
    .max(256, "Email cannot exceed 256 characters.")
    .trim()
    .toLowerCase(),
  password: z.string("Password is required.").nonempty("Password is required."),
});

const ForgotPasswordSchema = z.object({
  email: z
    .email({
      error: (err) => {
        if (!err.input) return "Email is required.";
        if (err.code === "invalid_format") return "Invalid email id.";
      },
    })
    .nonempty("Email is required.")
    .max(256, "Email cannot exceed 256 characters.")
    .trim()
    .toLowerCase(),
});

const ResetPasswordSchema = z.object({
  token: z
    .string("Reset password token is required.")
    .nonempty("Reset password token is required.")
    .max(1000, "Reset password token cannot exceed 1000 characters."),

  password: z
    .string("Password is required.")
    .nonempty("Password is required.")
    .min(8, "Password must be atleast 8 characters long."),
});

export default {
  CreateAccountSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
};
export type CreateAccountSchema = z.infer<typeof CreateAccountSchema>;
export type LoginSchema = z.infer<typeof LoginSchema>;
export type ForgotPasswordSchema = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;
