// src/pages/SettingsPage.jsx
import { useState, useEffect } from "react";
import "./SettingsPage.css";
import { useSettings } from "../context/SettingsContext";

const translations = {
  en: {
    settingsTitle: "Settings",
    settingsSubtitle: "Manage your profile, preferences and notifications.",
    profileTitle: "Profile",
    profileDesc: "Update how your name appears in the admin panel.",
    displayNameLabel: "Display name",
    displayNamePlaceholder: "Your name",
    prefsTitle: "Preferences",
    prefsDesc: "Choose your visual theme and interface language.",
    themeLabel: "Theme",
    languageLabel: "Language",
    themeOptionDark: "Dark",
    themeOptionLight: "Light",
    themeOptionSystem: "System",
    notifTitle: "Notifications",
    notifDesc: "Control which email updates you receive about activity.",
    mainEmailLabel: "Main email alerts",
    mainEmailSub: "Order updates, critical account messages.",
    weeklyLabel: "Weekly summary",
    weeklySub: "Get a weekly summary of users and orders.",
    savedPill: "Settings saved",
  },
  tr: {
    settingsTitle: "Ayarlar",
    settingsSubtitle: "Profilini, tercihlerini ve bildirimlerini yönet.",
    profileTitle: "Profil",
    profileDesc: "Panelde görünen adını güncelle.",
    displayNameLabel: "Görünen ad",
    displayNamePlaceholder: "Adın",
    prefsTitle: "Tercihler",
    prefsDesc: "Tema ve arayüz dilini seç.",
    themeLabel: "Tema",
    languageLabel: "Dil",
    themeOptionDark: "Koyu",
    themeOptionLight: "Açık",
    themeOptionSystem: "Sistem",
    notifTitle: "Bildirimler",
    notifDesc: "Hangi e-posta bildirimlerini alacağını kontrol et.",
    mainEmailLabel: "Temel e-posta bildirimleri",
    mainEmailSub: "Sipariş güncellemeleri ve kritik hesap mesajları.",
    weeklyLabel: "Haftalık özet",
    weeklySub: "Kullanıcılar ve siparişler için haftalık özet al.",
    savedPill: "Ayarlar kaydedildi",
  },
  es: {
    settingsTitle: "Configuración",
    settingsSubtitle: "Gestiona tu perfil, preferencias y notificaciones.",
    profileTitle: "Perfil",
    profileDesc: "Actualiza cómo aparece tu nombre en el panel.",
    displayNameLabel: "Nombre visible",
    displayNamePlaceholder: "Tu nombre",
    prefsTitle: "Preferencias",
    prefsDesc: "Elige el tema y el idioma de la interfaz.",
    themeLabel: "Tema",
    languageLabel: "Idioma",
    themeOptionDark: "Oscuro",
    themeOptionLight: "Claro",
    themeOptionSystem: "Sistema",
    notifTitle: "Notificaciones",
    notifDesc: "Controla qué correos recibes sobre la actividad.",
    mainEmailLabel: "Alertas principales",
    mainEmailSub: "Actualizaciones de pedidos y mensajes críticos.",
    weeklyLabel: "Resumen semanal",
    weeklySub: "Recibe un resumen semanal de usuarios y pedidos.",
    savedPill: "Configuración guardada",
  },
  de: {
    settingsTitle: "Einstellungen",
    settingsSubtitle:
      "Verwalte dein Profil, deine Präferenzen und Benachrichtigungen.",
    profileTitle: "Profil",
    profileDesc: "Aktualisiere, wie dein Name im Admin-Panel erscheint.",
    displayNameLabel: "Anzeigename",
    displayNamePlaceholder: "Dein Name",
    prefsTitle: "Präferenzen",
    prefsDesc: "Wähle das Design und die Sprache der Oberfläche.",
    themeLabel: "Theme",
    languageLabel: "Sprache",
    themeOptionDark: "Dunkel",
    themeOptionLight: "Hell",
    themeOptionSystem: "System",
    notifTitle: "Benachrichtigungen",
    notifDesc:
      "Steuere, welche E-Mail-Benachrichtigungen du erhältst.",
    mainEmailLabel: "Haupt-E-Mail-Benachrichtigungen",
    mainEmailSub: "Bestellupdates und wichtige Kontomeldungen.",
    weeklyLabel: "Wöchentliche Zusammenfassung",
    weeklySub:
      "Erhalte eine wöchentliche Zusammenfassung von Nutzern und Bestellungen.",
    savedPill: "Einstellungen gespeichert",
  },
  fr: {
    settingsTitle: "Paramètres",
    settingsSubtitle:
      "Gérez votre profil, vos préférences et vos notifications.",
    profileTitle: "Profil",
    profileDesc: "Mettez à jour la façon dont votre nom apparaît dans le panel.",
    displayNameLabel: "Nom affiché",
    displayNamePlaceholder: "Votre nom",
    prefsTitle: "Préférences",
    prefsDesc: "Choisissez le thème et la langue de l’interface.",
    themeLabel: "Thème",
    languageLabel: "Langue",
    themeOptionDark: "Sombre",
    themeOptionLight: "Clair",
    themeOptionSystem: "Système",
    notifTitle: "Notifications",
    notifDesc:
      "Contrôlez les e-mails que vous recevez à propos de l’activité.",
    mainEmailLabel: "Alertes principales",
    mainEmailSub: "Mises à jour de commandes et messages importants.",
    weeklyLabel: "Résumé hebdomadaire",
    weeklySub:
      "Recevez un résumé hebdomadaire des utilisateurs et des commandes.",
    savedPill: "Paramètres enregistrés",
  },
  it: {
    settingsTitle: "Impostazioni",
    settingsSubtitle:
      "Gestisci il tuo profilo, le preferenze e le notifiche.",
    profileTitle: "Profilo",
    profileDesc: "Aggiorna come appare il tuo nome nel pannello.",
    displayNameLabel: "Nome visualizzato",
    displayNamePlaceholder: "Il tuo nome",
    prefsTitle: "Preferenze",
    prefsDesc: "Scegli il tema e la lingua dell’interfaccia.",
    themeLabel: "Tema",
    languageLabel: "Lingua",
    themeOptionDark: "Scuro",
    themeOptionLight: "Chiaro",
    themeOptionSystem: "Sistema",
    notifTitle: "Notifiche",
    notifDesc:
      "Controlla quali e-mail ricevi sull’attività dell’account.",
    mainEmailLabel: "Avvisi principali",
    mainEmailSub: "Aggiornamenti ordini e messaggi critici.",
    weeklyLabel: "Riepilogo settimanale",
    weeklySub:
      "Ricevi un riepilogo settimanale di utenti e ordini.",
    savedPill: "Impostazioni salvate",
  },
  ru: {
    settingsTitle: "Настройки",
    settingsSubtitle:
      "Управляйте профилем, предпочтениями и уведомлениями.",
    profileTitle: "Профиль",
    profileDesc:
      "Измените, как ваше имя отображается в админ-панели.",
    displayNameLabel: "Отображаемое имя",
    displayNamePlaceholder: "Ваше имя",
    prefsTitle: "Предпочтения",
    prefsDesc: "Выберите тему и язык интерфейса.",
    themeLabel: "Тема",
    languageLabel: "Язык",
    themeOptionDark: "Тёмная",
    themeOptionLight: "Светлая",
    themeOptionSystem: "Системная",
    notifTitle: "Уведомления",
    notifDesc:
      "Управляйте e-mail-уведомлениями об активности.",
    mainEmailLabel: "Основные уведомления",
    mainEmailSub:
      "Обновления заказов и важные сообщения по аккаунту.",
    weeklyLabel: "Еженедельный отчёт",
    weeklySub:
      "Получайте еженедельный отчёт по пользователям и заказам.",
    savedPill: "Настройки сохранены",
  },
};

const languageOptions = [
  { value: "en", label: "English" },
  { value: "tr", label: "Türkçe" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "it", label: "Italiano" },
  { value: "ru", label: "Русский" },
];

function SettingsPage({ language }) {
  const { settings, updateSettings, language: ctxLanguage } = useSettings();
  const [savedState, setSavedState] = useState("");

  const safeSettings = settings || {
    displayName: "",
    theme: "dark",
    language: "en",
    emailAlerts: true,
    weeklySummary: false,
  };

  // Dil önceliği: prop > context.language > settings.language > "en"
  const langKey = language || ctxLanguage || safeSettings.language || "en";
  const t = translations[langKey] || translations.en;

  useEffect(() => {
    if (!settings) return;
    setSavedState("saved");
    const timeout = setTimeout(() => setSavedState(""), 1500);
    return () => clearTimeout(timeout);
  }, [settings]);

  const handleChange = (field, value) => {
    updateSettings({ [field]: value });
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div>
          <h2>{t.settingsTitle}</h2>
          <p>{t.settingsSubtitle}</p>
        </div>
        {savedState && (
          <span className="settings-saved-pill">
            {t.savedPill}
          </span>
        )}
      </div>

      <div className="settings-grid">
        {/* PROFILE */}
        <section className="settings-card">
          <h3>{t.profileTitle}</h3>
          <p className="settings-description">
            {t.profileDesc}
          </p>

          <div className="settings-field">
            <label>{t.displayNameLabel}</label>
            <input
              type="text"
              value={safeSettings.displayName}
              onChange={(e) =>
                handleChange("displayName", e.target.value)
              }
              placeholder={t.displayNamePlaceholder}
            />
          </div>
        </section>

        {/* PREFERENCES */}
        <section className="settings-card">
          <h3>{t.prefsTitle}</h3>
          <p className="settings-description">
            {t.prefsDesc}
          </p>

          <div className="settings-field">
            <label>{t.themeLabel}</label>
            <select
              value={safeSettings.theme}
              onChange={(e) =>
                handleChange("theme", e.target.value)
              }
            >
              <option value="dark">{t.themeOptionDark}</option>
              <option value="light">{t.themeOptionLight}</option>
              <option value="system">{t.themeOptionSystem}</option>
            </select>
          </div>

          <div className="settings-field">
            <label>{t.languageLabel}</label>
            <select
              value={safeSettings.language}
              onChange={(e) =>
                handleChange("language", e.target.value)
              }
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* NOTIFICATIONS */}
        <section className="settings-card">
          <h3>{t.notifTitle}</h3>
          <p className="settings-description">
            {t.notifDesc}
          </p>

          <div className="settings-toggle-row">
            <label>
              <span>{t.mainEmailLabel}</span>
              <small>{t.mainEmailSub}</small>
            </label>
            <button
              className={`toggle-pill ${
                safeSettings.emailAlerts ? "on" : "off"
              }`}
              onClick={() =>
                handleChange("emailAlerts", !safeSettings.emailAlerts)
              }
            >
              <span className="toggle-thumb" />
            </button>
          </div>

          <div className="settings-toggle-row">
            <label>
              <span>{t.weeklyLabel}</span>
              <small>{t.weeklySub}</small>
            </label>
            <button
              className={`toggle-pill ${
                safeSettings.weeklySummary ? "on" : "off"
              }`}
              onClick={() =>
                handleChange(
                  "weeklySummary",
                  !safeSettings.weeklySummary
                )
              }
            >
              <span className="toggle-thumb" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
