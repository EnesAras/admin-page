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
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: String(email || "").trim().toLowerCase(),
        password: String(password || "").trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Login failed");
    }

    setIsAuthenticated(true);
    setCurrentUser(data.user);

    localStorage.setItem("admin_isAuthenticated", "true");
    localStorage.setItem("admin_currentUser", JSON.stringify(data.user));

    return data.user;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    throw err;
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
