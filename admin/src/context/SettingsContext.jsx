// src/context/SettingsContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import translations from "../i18n/translations";

const defaultSettings = {
  displayName: "Admin User",
  theme: "dark", // "dark" | "light" | "system"
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
        return {
          ...defaultSettings,
          ...JSON.parse(stored),
        };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const [prefersDark, setPrefersDark] = useState(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return true;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (typeof window.matchMedia !== "function") return undefined;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      setPrefersDark(event.matches);
    };

    setPrefersDark(mql.matches);

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handleChange);
      return () => {
        mql.removeEventListener("change", handleChange);
      };
    }

    mql.addListener(handleChange);
    return () => {
      mql.removeListener(handleChange);
    };
  }, []);

  const effectiveTheme = useMemo(() => {
    const targetTheme = settings.theme || "dark";
    if (targetTheme === "system") {
      return prefersDark ? "dark" : "light";
    }
    return targetTheme;
  }, [settings.theme, prefersDark]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyTheme = (theme) => {
      document.body.classList.remove("theme-light", "theme-dark");
      document.body.classList.add(`theme-${theme}`);
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.classList.remove("app-light", "app-dark");
      document.documentElement.classList.add(`app-${theme}`);
      document.body.dataset.userTheme = settings.theme || "dark";
    };

    applyTheme(effectiveTheme);
  }, [effectiveTheme, settings.theme]);

  // 💾 Her değişiklikte localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem("admin_settings", JSON.stringify(settings));
  }, [settings]);

  // 🔧 Genel update fonksiyonu (patch)
  const updateSettings = (patch) => {
    setSettings((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  // 🆕 SettingsPage'in beklediği tek key/value fonksiyonu
  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const setTheme = (theme) => {
    updateSettings({ theme });
  };

  const toggleTheme = () => {
    updateSettings({
      theme: settings.theme === "light" ? "dark" : "light",
    });
  };

  const setLanguage = (language) => {
    updateSettings({ language });
  };

  const t = (key, fallback) => {
    const langCode = settings.language || "en";
    const langPack = translations[langCode] || translations.en;

    return (
      langPack[key] ??
      translations.en[key] ??
      fallback ??
      key
    );
  };

  const value = {
    settings,
    updateSettings,
    updateSetting,
    theme: settings.theme,
    colorMode: effectiveTheme,
    language: settings.language,
    setTheme,
    toggleTheme,
    setLanguage,
    t,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
