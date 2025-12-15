// src/context/SettingsContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
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

  // 💾 Her değişiklikte localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem("admin_settings", JSON.stringify(settings));
  }, [settings]);

  // 🎨 Tema sınıflarını yönet (body / html)
  useEffect(() => {
    const mql =
      typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;

    const applyTheme = (theme) => {
      document.body.classList.remove("theme-light", "theme-dark");
      if (theme === "light") {
        document.body.classList.add("theme-light");
      } else {
        document.body.classList.add("theme-dark");
      }
      document.documentElement.setAttribute("data-theme", theme);
    };

    const resolveTheme = () => {
      if (settings.theme === "system") {
        const osDark = mql ? mql.matches : false;
        applyTheme(osDark ? "dark" : "light");
      } else {
        applyTheme(settings.theme);
      }
    };

    resolveTheme();

    if (settings.theme === "system" && mql) {
      const handler = (event) => {
        applyTheme(event.matches ? "dark" : "light");
      };
      mql.addEventListener
        ? mql.addEventListener("change", handler)
        : mql.addListener(handler);

      return () => {
        mql.removeEventListener
          ? mql.removeEventListener("change", handler)
          : mql.removeListener(handler);
      };
    }
  }, [settings.theme]);

  // 🔧 Genel update fonksiyonu (patch)
  const updateSettings = (patch) => {
    setSettings((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  // 🆕 SettingsPage'in beklediği tek key/value fonksiyonu
  // updateSetting("theme", "dark") gibi çağrılıyor
  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 🔥 Tema için helper'lar
  const setTheme = (theme) => {
    updateSettings({ theme });
  };

  const toggleTheme = () => {
    updateSettings({
      theme: settings.theme === "light" ? "dark" : "light",
    });
  };

  // 🌍 Dil için helper
  const setLanguage = (language) => {
    updateSettings({ language });
  };

  // 🌐 GLOBAL TRANSLATION FONKSİYONU
  const t = (key) => {
    const langCode = settings.language || "en";
    const langPack = translations[langCode] || translations.en;

    // Önce seçili dil, yoksa en, o da yoksa key'i olduğu gibi döndür
    return langPack[key] || translations.en[key] || key;
  };

  const value = {
    settings,
    updateSettings,
    updateSetting,
    theme: settings.theme,
    language: settings.language,
    setTheme,
    toggleTheme,
    setLanguage,
    t, // 💥 her yerden kullanacağız
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
