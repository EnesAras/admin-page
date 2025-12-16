// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { apiFetch } from "../lib/api";

const STORAGE_KEYS = {
  auth: "admin_isAuthenticated",
  user: "admin_currentUser",
  token: "admin_authToken",
};

const getSessionStorage = () =>
  typeof window !== "undefined" ? window.sessionStorage : null;
const getLocalStorage = () =>
  typeof window !== "undefined" ? window.localStorage : null;

const readSessionValue = (key) => {
  const session = getSessionStorage();
  return session ? session.getItem(key) : null;
};

const writeSessionValue = (key, value) => {
  const session = getSessionStorage();
  if (!session) return;
  if (value === null || value === undefined) {
    session.removeItem(key);
    return;
  }
  session.setItem(key, value);
};

const clearAuthPersistence = () => {
  const session = getSessionStorage();
  const local = getLocalStorage();
  Object.values(STORAGE_KEYS).forEach((key) => {
    session?.removeItem(key);
    local?.removeItem(key);
  });
};

const readCurrentUser = () => {
  const stored = readSessionValue(STORAGE_KEYS.user);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return readSessionValue(STORAGE_KEYS.auth) === "true";
  });

  const [currentUser, setCurrentUser] = useState(readCurrentUser);

  useEffect(() => {
    if (!getSessionStorage()) return;

    if (isAuthenticated && currentUser) {
      writeSessionValue(STORAGE_KEYS.auth, "true");
      writeSessionValue(STORAGE_KEYS.user, JSON.stringify(currentUser));
    } else if (!isAuthenticated) {
      writeSessionValue(STORAGE_KEYS.auth, null);
      writeSessionValue(STORAGE_KEYS.user, null);
      writeSessionValue(STORAGE_KEYS.token, null);
    }
  }, [currentUser, isAuthenticated]);

  const login = async (email, password) => {
    try {
      const payload = {
        email: String(email || "").trim().toLowerCase(),
        password: String(password || "").trim(),
      };

      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const token =
        data?.token ??
        data?.authToken ??
        data?.accessToken ??
        data?.access_token ??
        null;
      const resolvedUser =
        data?.user ??
        data?.data?.user ??
        data?.payload?.user ??
        data?.result?.user ??
        null;
      const capabilities =
        data?.capabilities ??
        data?.permissions ??
        resolvedUser?.capabilities ??
        null;

      writeSessionValue(STORAGE_KEYS.token, token);

      if (!resolvedUser) {
        clearAuthPersistence();
        throw new Error("Login succeeded but user payload is missing.");
      }

      if (capabilities) {
        resolvedUser.capabilities = capabilities;
      }

      const serializedUser = JSON.stringify(resolvedUser);
      writeSessionValue(STORAGE_KEYS.auth, "true");
      writeSessionValue(STORAGE_KEYS.user, serializedUser);
      const local = getLocalStorage();
      local?.setItem(STORAGE_KEYS.user, serializedUser);

      setIsAuthenticated(true);
      setCurrentUser(resolvedUser);

      return resolvedUser;
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      throw err;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    clearAuthPersistence();
  };

  const hasRole = useCallback(
    (allowedRoles) => {
      if (!allowedRoles) return true;
      const required = Array.isArray(allowedRoles)
        ? allowedRoles
        : [allowedRoles];
      const currentRole = (currentUser?.role || "").toLowerCase();
      if (!currentRole) return false;
      return required.some(
        (role) => String(role).toLowerCase() === currentRole
      );
    },
    [currentUser]
  );

  const value = useMemo(
    () => ({ isAuthenticated, currentUser, login, logout, hasRole }),
    [isAuthenticated, currentUser, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
