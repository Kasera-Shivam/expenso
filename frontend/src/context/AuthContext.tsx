import type { User } from "@/@types";
import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, setAccessToken, refreshAccessToken } from "@/api";

type AuthContextType = {
  loading: boolean;
  user: User | null;
  setSession: (user: User, accessToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);

  const clearSession = React.useCallback(() => {
    setAccessToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  React.useEffect(() => {
    refreshAccessToken()
      .then(() => api.get("/account/me"))
      .then((res) => setUser(res.data.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    window.addEventListener("auth:logout", clearSession);
    return () => window.removeEventListener("auth:logout", clearSession);
  }, [clearSession]);

  const setSession = React.useCallback((user: User, accessToken: string) => {
    setAccessToken(accessToken);
    setUser(user);
  }, []);

  const updateUser = React.useCallback((patch: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await api.post("/account/logout");
    } catch {
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = React.useMemo(
    () => ({ loading, user, setSession, updateUser, logout }),
    [loading, user, setSession, updateUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>.");
  return ctx;
};
