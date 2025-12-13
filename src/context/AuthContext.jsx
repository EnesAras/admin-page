// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("admin_isAuthenticated") === "true";
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("admin_currentUser");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: String(email || "").trim().toLowerCase(),
          password: String(password || "").trim(),
        }),
      });

      setIsAuthenticated(true);
      setCurrentUser(data.user || null);

      localStorage.setItem("admin_isAuthenticated", "true");
      localStorage.setItem("admin_currentUser", JSON.stringify(data.user || null));

      return data.user;
    } catch (err) {
      if (err?.message === "UserNotFound") throw new Error("UserNotFound");
      if (err?.message === "WrongPassword") throw new Error("WrongPassword");
      throw new Error("LoginFailed");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem("admin_isAuthenticated");
    localStorage.removeItem("admin_currentUser");
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (currentUser) {
      localStorage.setItem("admin_currentUser", JSON.stringify(currentUser));
    }
  }, [isAuthenticated, currentUser]);

  const value = useMemo(
    () => ({ isAuthenticated, currentUser, login, logout }),
    [isAuthenticated, currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
