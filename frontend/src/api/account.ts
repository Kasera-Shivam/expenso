import type { AuthResponse, Session, User } from "@/@types";
import type {
  UpdateAccountSchema,
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

export const updateAccount = (body: UpdateAccountSchema) =>
  api
    .patch("/account/update", {
      firstName: body.firstName,
      lastName: body.lastName || null,
    })
    .then((r) => r.data.data.user as User);

export const updateAvatar = (file: File) => {
  const form = new FormData();
  form.append("avatar", file);
  return api
    .patch("/account/update/avatar", form)
    .then((r) => r.data.data.user as Pick<User, "id" | "avatar">);
};

export const changePassword = (body: {
  currentPassword: string;
  newPassword: string;
}) =>
  api
    .put("/account/password/change", body)
    .then((r) => r.data.data as { signedOutSessions: number });

export const fetchSessions = () =>
  api.get("/account/sessions").then((r) => r.data.data.sessions as Session[]);

export const revokeSession = (id: string) =>
  api.delete(`/account/sessions/${id}`).then(() => id);

export const revokeOtherSessions = () =>
  api
    .delete("/account/sessions")
    .then((r) => r.data.data as { signedOutSessions: number });
