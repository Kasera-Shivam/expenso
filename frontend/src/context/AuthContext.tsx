import React from "react";
import { api, setAccessToken, refreshAccessToken } from "@/api";

export type User = {
  id: string;
  firstName: string;
  lastName: string | null;
  name: string;
  avatar: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

type AuthContextType = {
  loading: boolean;
  user: User | null;
  setSession: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    refreshAccessToken()
      .then(() => api.get("/account/me"))
      .then((res) => setUser(res.data.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    const onLogout = () => setUser(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const setSession = React.useCallback((user: User, accessToken: string) => {
    setUser(user);
    setAccessToken(accessToken);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await api.post("/account/logout");
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ loading, user, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>.");
  return ctx;
};
