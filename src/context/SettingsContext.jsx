// src/context/SettingsContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

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
    let effectiveTheme = settings.theme;

    // system seçiliyse OS tercihine göre karar ver
    if (effectiveTheme === "system" && window.matchMedia) {
      const prefersLight = window.matchMedia(
        "(prefers-color-scheme: light)"
      ).matches;
      effectiveTheme = prefersLight ? "light" : "dark";
    }

    // Önce önceki sınıfları temizle
    document.body.classList.remove("theme-light", "theme-dark");

    // Sonra aktif temayı ekle
    if (effectiveTheme === "light") {
      document.body.classList.add("theme-light");
    } else {
      document.body.classList.add("theme-dark");
    }

    // İstersen ileride CSS'te kullanmak için
    document.documentElement.setAttribute("data-theme", effectiveTheme);
  }, [settings.theme]);

  // 🔧 Genel update fonksiyonu (SettingsPage için)
  const updateSettings = (patch) => {
    setSettings((prev) => ({
      ...prev,
      ...patch,
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

  const value = {
    settings,
    updateSettings,
    theme: settings.theme,
    language: settings.language,
    setTheme,
    toggleTheme,
    setLanguage,
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
