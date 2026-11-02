import type { AuthResponse } from "@/@types";
import type {
  CreateAccountSchema,
  ForgotPasswordSchema,
  LoginSchema,
  ResetPasswordSchema,
} from "@/validations/account.validation";
import { api } from ".";

export const createAccount = (body: CreateAccountSchema) =>
  api.post("/account/create", body).then((r) => r.data.data as AuthResponse);

export const login = (body: LoginSchema) =>
  api.post("/account/login", body).then((r) => r.data.data as AuthResponse);

export const forgotPassword = (body: ForgotPasswordSchema) =>
  api
    .post("/account/password/forgot", body)
    .then((r) => r.data.message as string);

export const resetPassword = (body: ResetPasswordSchema) =>
  api
    .put("/account/password/reset", body)
    .then((r) => r.data.message as string);
