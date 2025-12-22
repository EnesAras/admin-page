import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/theme.css";
import { SettingsProvider } from "./context/SettingsContext";
import { AuthProvider } from "./context/AuthContext";
import { LayoutProvider } from "./context/LayoutContext";
import { ToastProvider } from "./context/ToastContext";
import { applyDocumentTheme } from "./utils/themeUtils";

const root = ReactDOM.createRoot(document.getElementById("root"));

const initializeRootTheme = () => {
  if (typeof window === "undefined") return;

  const stored = window.localStorage?.getItem("admin_settings");
  let userTheme = "dark";

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.theme) {
        userTheme = parsed.theme;
      }
    } catch {
      //
    }
  }

  if (userTheme === "system") {
    const prefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyDocumentTheme(prefersDark ? "dark" : "light", "system");
    return;
  }

  const finalTheme = userTheme === "light" ? "light" : "dark";
  applyDocumentTheme(finalTheme, userTheme);
};

initializeRootTheme();

root.render(
  <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <LayoutProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </LayoutProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
  </React.StrictMode>
);
