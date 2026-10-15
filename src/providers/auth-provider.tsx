import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AdminUser } from "@/features/admin/types";
import {
  clearAdminSession,
  getAdminToken,
  getAdminUser,
  isAdminAuthenticated,
  setAdminToken,
  setAdminUser,
} from "@/lib/auth";
import { setSessionEndHandler } from "@/lib/session";
import { router } from "@/router";

type LoginSession = {
  token: string;
  user: AdminUser;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  token: string | null;
  user: AdminUser | null;
  loginSuccess: (session?: LoginSession) => void;
  updateCurrentUser: (user: AdminUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => getAdminToken());
  const [user, setUser] = useState<AdminUser | null>(() => getAdminUser());

  const loginSuccess = useCallback((session?: LoginSession) => {
    if (session) {
      setAdminToken(session.token);
      setAdminUser(session.user);
      setToken(session.token);
      setUser(session.user);
      return;
    }

    setToken(getAdminToken());
    setUser(getAdminUser());
  }, []);

  const updateCurrentUser = useCallback((nextUser: AdminUser) => {
    setAdminUser(nextUser);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearAdminSession();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setSessionEndHandler((reason) => {
      logout();
      queryClient.clear();
      void router.navigate({ to: "/admin/login", search: { reason }, replace: true });
    });
    return () => setSessionEndHandler(null);
  }, [logout, queryClient]);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token) || isAdminAuthenticated(),
      token,
      user,
      loginSuccess,
      updateCurrentUser,
      logout,
    }),
    [token, user, loginSuccess, updateCurrentUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
