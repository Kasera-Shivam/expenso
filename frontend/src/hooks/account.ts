import { createAccount, login } from "@/api/account";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/error";
import { useMutation } from "@tanstack/react-query";
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
