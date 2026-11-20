import {
  changePassword,
  createAccount,
  fetchSessions,
  forgotPassword,
  login,
  resetPassword,
  revokeOtherSessions,
  revokeSession,
  updateAccount,
  updateAvatar,
} from "@/api/account";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateAccount = () => {
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: createAccount,
    onSuccess: ({ user, accessToken }) => {
      setSession(user, accessToken);
      toast.success("Account created successfully.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useLogin = () => {
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: login,
    onSuccess: ({ user, accessToken }) => {
      setSession(user, accessToken);
      toast.success("Login successfully.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useForgotPassword = () =>
  useMutation({
    mutationFn: forgotPassword,
    onError: (error) => toast.error(getErrorMessage(error)),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: resetPassword,
    onError: (error) => toast.error(getErrorMessage(error)),
  });

export const useUpdateAccount = () => {
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: updateAccount,
    onSuccess: (user) => {
      updateUser(user);
      toast.success("Account updated successfully.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateAvatar = () => {
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: updateAvatar,
    onSuccess: ({ avatar }) => {
      updateUser({ avatar });
      toast.success("Photo updated.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: ({ signedOutSessions }) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success(
        signedOutSessions > 0
          ? `Password changed. Signed out of ${signedOutSessions} other ${signedOutSessions === 1 ? "device" : "devices"}.`
          : "Password changed.",
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useSessions = () =>
  useQuery({ queryKey: ["sessions"], queryFn: fetchSessions });

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Device signed out.");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useRevokeOtherSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeOtherSessions,
    onSuccess: ({ signedOutSessions }) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success(
        signedOutSessions > 0
          ? "Signed out of all other devices."
          : "No other devices were signed in.",
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};
