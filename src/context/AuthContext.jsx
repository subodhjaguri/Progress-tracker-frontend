/* eslint-disable react-refresh/only-export-components -- context hook co-located with its provider */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api, unwrap } from "../lib/api.js";
import { getToken, setToken, clearToken } from "../lib/token.js";
import { initials, ROLE_LABELS } from "../lib/format.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authed | guest

  const loadMe = useCallback(async () => {
    if (!getToken()) {
      setStatus("guest");
      return;
    }
    try {
      const res = await api.get("/auth/me");
      setUser(unwrap(res).user);
      setStatus("authed");
    } catch {
      clearToken();
      setUser(null);
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  // The api 401 interceptor fires this when a token expires mid-session.
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setStatus("guest");
    };
    window.addEventListener("pt:unauthorized", onUnauthorized);
    return () => window.removeEventListener("pt:unauthorized", onUnauthorized);
  }, []);

  const login = async (mobile, password) => {
    const res = await api.post("/auth/login", { mobile, password });
    const data = unwrap(res);
    setToken(data.token);
    setUser(data.user);
    setStatus("authed");
    return data.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setStatus("guest");
  };

  const role = user?.role ?? null;
  const profile = user
    ? {
        name: user.name,
        initials: initials(user.name),
        roleLabel: ROLE_LABELS[user.role] ?? user.role,
      }
    : null;

  const value = { user, role, status, profile, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
