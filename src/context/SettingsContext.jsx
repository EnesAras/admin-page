import { createContext, useContext, useState, useEffect } from "react";

const defaultSettings = {
  displayName: "Admin User",
  theme: "dark",
  language: "en",
  emailAlerts: true,
  weeklySummary: true,
};

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem("admin_settings");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("admin_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    let theme = settings.theme;
    if (theme === "system" && window.matchMedia) {
      const prefersLight = window.matchMedia(
        "(prefers-color-scheme: light)"
      ).matches;
      theme = prefersLight ? "light" : "dark";
    }
    if (theme === "light") {
      document.body.classList.add("theme-light");
    } else {
      document.body.classList.remove("theme-light");
    }
  }, [settings.theme]);

  const updateSettings = (patch) => {
    setSettings((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
