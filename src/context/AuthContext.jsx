// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Sayfa her açıldığında / yenilendiğinde false'tan başlasın
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Backend'e istek atan login
  const login = async (email, password) => {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (res.status === 404) {
      throw new Error("UserNotFound");
    }

    if (res.status === 401) {
      throw new Error("WrongPassword");
    }

    if (!res.ok) {
      throw new Error("LoginFailed");
    }

    const data = await res.json();

    setIsAuthenticated(true);
    setCurrentUser(data.user); // { id, email, name, role }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const value = {
    isAuthenticated,
    currentUser,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}
