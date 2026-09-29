import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AdminUser } from "@/features/admin/types";
import {
  clearAdminSession,
  getAdminToken,
  getAdminUser,
  isAdminAuthenticated,
  setAdminToken,
  setAdminUser,
} from "@/lib/auth";

type LoginSession = {
  token: string;
  user: AdminUser;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  token: string | null;
  user: AdminUser | null;
  loginSuccess: (session?: LoginSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
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

  const logout = useCallback(() => {
    clearAdminSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token) || isAdminAuthenticated(),
      token,
      user,
      loginSuccess,
      logout,
    }),
    [token, user, loginSuccess, logout]
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
