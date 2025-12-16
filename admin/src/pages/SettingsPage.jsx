// src/pages/SettingsPage.jsx
import { useState, useEffect } from "react";
import "./SettingsPage.css";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";

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
    moderatorTitle: "Limited control mode",
    moderatorSubtitle: "You can only update theme and language preferences.",
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
    themeOptionDark: "Karanlık",
    themeOptionLight: "Açık",
    themeOptionSystem: "Sistem",

    notifTitle: "Bildirimler",
    notifDesc: "Hangi e-posta güncellemelerini alacağını seç.",
    mainEmailLabel: "Ana e-posta uyarıları",
    mainEmailSub: "Sipariş güncellemeleri, kritik hesap mesajları.",
    weeklyLabel: "Haftalık özet",
    weeklySub: "Kullanıcılar ve siparişler için haftalık özet al.",

    savedPill: "Ayarlar kaydedildi",
    moderatorTitle: "Sınırlı kontrol modu",
    moderatorSubtitle: "Yalnızca tema ve dil tercihlerini değiştirebilirsin.",
  },
  de: {
    settingsTitle: "Einstellungen",
    settingsSubtitle: "Verwalte Profil, Präferenzen und Benachrichtigungen.",

    profileTitle: "Profil",
    profileDesc: "Aktualisiere, wie dein Name im Admin-Panel angezeigt wird.",
    displayNameLabel: "Anzeigename",
    displayNamePlaceholder: "Dein Name",

    prefsTitle: "Präferenzen",
    prefsDesc: "Wähle Thema und Sprache der Oberfläche.",
    themeLabel: "Theme",
    languageLabel: "Sprache",
    themeOptionDark: "Dunkel",
    themeOptionLight: "Hell",
    themeOptionSystem: "System",

    notifTitle: "Benachrichtigungen",
    notifDesc: "Steuere, welche E-Mails du erhältst.",
    mainEmailLabel: "Wichtige E-Mails",
    mainEmailSub: "Bestell-Updates, wichtige Konto-Nachrichten.",
    weeklyLabel: "Wöchentliche Zusammenfassung",
    weeklySub: "Wöchentlicher Überblick über Nutzer und Bestellungen.",

    savedPill: "Einstellungen gespeichert",
    moderatorTitle: "Eingeschränkter Modus",
    moderatorSubtitle: "Du kannst nur Theme und Sprache anpassen.",
  },
  es: {
    settingsTitle: "Configuración",
    settingsSubtitle: "Administra tu perfil, preferencias y notificaciones.",

    profileTitle: "Perfil",
    profileDesc: "Actualiza cómo aparece tu nombre en el panel.",
    displayNameLabel: "Nombre visible",
    displayNamePlaceholder: "Tu nombre",

    prefsTitle: "Preferencias",
    prefsDesc: "Elige tema visual e idioma de la interfaz.",
    themeLabel: "Tema",
    languageLabel: "Idioma",
    themeOptionDark: "Oscuro",
    themeOptionLight: "Claro",
    themeOptionSystem: "Sistema",

    notifTitle: "Notificaciones",
    notifDesc: "Controla qué correos electrónicos recibes.",
    mainEmailLabel: "Alertas principales",
    mainEmailSub: "Actualizaciones de pedidos, mensajes importantes.",
    weeklyLabel: "Resumen semanal",
    weeklySub: "Resumen semanal de usuarios y pedidos.",

    savedPill: "Configuración guardada",
    moderatorTitle: "Modo de control limitado",
    moderatorSubtitle: "Solo puedes modificar el tema y el idioma.",
  },
  fr: {
    settingsTitle: "Paramètres",
    settingsSubtitle: "Gère ton profil, tes préférences et notifications.",

    profileTitle: "Profil",
    profileDesc: "Modifie la façon dont ton nom apparaît dans le panel.",
    displayNameLabel: "Nom affiché",
    displayNamePlaceholder: "Ton nom",

    prefsTitle: "Préférences",
    prefsDesc: "Choisis le thème visuel et la langue de l’interface.",
    themeLabel: "Thème",
    languageLabel: "Langue",
    themeOptionDark: "Sombre",
    themeOptionLight: "Clair",
    themeOptionSystem: "Système",

    notifTitle: "Notifications",
    notifDesc: "Contrôle les emails que tu reçois.",
    mainEmailLabel: "Alertes principales",
    mainEmailSub: "Mises à jour de commandes, messages critiques.",
    weeklyLabel: "Résumé hebdomadaire",
    weeklySub: "Résumé hebdomadaire des utilisateurs et commandes.",

    savedPill: "Paramètres enregistrés",
    moderatorTitle: "Mode d'accès limité",
    moderatorSubtitle:
      "Tu peux uniquement définir le thème et la langue.",
  },
  it: {
    settingsTitle: "Impostazioni",
    settingsSubtitle: "Gestisci profilo, preferenze e notifiche.",

    profileTitle: "Profilo",
    profileDesc: "Aggiorna come appare il tuo nome nel pannello.",
    displayNameLabel: "Nome visualizzato",
    displayNamePlaceholder: "Il tuo nome",

    prefsTitle: "Preferenze",
    prefsDesc: "Scegli tema e lingua dell’interfaccia.",
    themeLabel: "Tema",
    languageLabel: "Lingua",
    themeOptionDark: "Scuro",
    themeOptionLight: "Chiaro",
    themeOptionSystem: "Sistema",

    notifTitle: "Notifiche",
    notifDesc: "Controlla quali email ricevi.",
    mainEmailLabel: "Email principali",
    mainEmailSub: "Aggiornamenti ordini, messaggi critici.",
    weeklyLabel: "Riepilogo settimanale",
    weeklySub: "Riepilogo settimanale di utenti e ordini.",

    savedPill: "Impostazioni salvate",
    moderatorTitle: "Modalità controllo limitata",
    moderatorSubtitle: "Puoi modificare solo tema e lingua.",
  },
  ru: {
    settingsTitle: "Настройки",
    settingsSubtitle: "Управляй профилем, предпочтениями и уведомлениями.",

    profileTitle: "Профиль",
    profileDesc: "Измени, как твоё имя отображается в панели.",
    displayNameLabel: "Отображаемое имя",
    displayNamePlaceholder: "Твоё имя",

    prefsTitle: "Предпочтения",
    prefsDesc: "Выбери тему и язык интерфейса.",
    themeLabel: "Тема",
    languageLabel: "Язык",
    themeOptionDark: "Тёмная",
    themeOptionLight: "Светлая",
    themeOptionSystem: "Системная",

    notifTitle: "Уведомления",
    notifDesc: "Управляй email-уведомлениями.",
    mainEmailLabel: "Основные уведомления",
    mainEmailSub: "Обновления заказов, важные сообщения.",
    weeklyLabel: "Еженедельный отчёт",
    weeklySub: "Краткий отчёт по пользователям и заказам.",

    savedPill: "Настройки сохранены",
    moderatorTitle: "Ограниченный режим",
    moderatorSubtitle: "Можно менять только тему и язык.",
  },
};

function SettingsPage() {
  const { settings, updateSetting } = useSettings();
  const [displayName, setDisplayName] = useState(settings.displayName || "");
  const [showSaved, setShowSaved] = useState(false);
  const { currentUser } = useAuth();
  const isModerator =
    String(currentUser?.role || "").trim().toLowerCase() === "moderator";

  const currentLang = settings.language || "en";
  const t = translations[currentLang] || translations.en;

  const triggerSaved = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1500);
  };

  const handleLanguageChange = (e) => {
    updateSetting("language", e.target.value);
    triggerSaved();
  };

  const handleDisplayNameBlur = () => {
    if (displayName !== settings.displayName) {
      updateSetting("displayName", displayName.trim());
      triggerSaved();
    }
  };

  const handleMainEmailChange = (e) => {
    updateSetting("mainEmail", e.target.checked);
    triggerSaved();
  };

  const handleWeeklyChange = (e) => {
    updateSetting("weeklySummary", e.target.checked);
    triggerSaved();
  };

  useEffect(() => {
    setDisplayName(settings.displayName || "");
  }, [settings.displayName]);

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div>
          <h2>{t.settingsTitle}</h2>
          <p>{t.settingsSubtitle}</p>
        </div>

        {showSaved && (
          <div className="settings-saved-pill">
            {t.savedPill}
          </div>
        )}
      </div>

      {isModerator && (
        <section className="settings-moderator-note">
          <p className="settings-moderator-title">
            {t.moderatorTitle ||
              "Moderators can only update the look & feel."}
          </p>
          <p className="settings-moderator-subtitle">
            {t.moderatorSubtitle ||
              "Theme and language settings are the only available preferences."}
          </p>
        </section>
      )}

      <div className="settings-grid">
        {!isModerator && (
          <section className="settings-card">
            <div className="settings-card-header">
              <div>
                <h3>{t.profileTitle}</h3>
                <p>{t.profileDesc}</p>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="displayName">{t.displayNameLabel}</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onBlur={handleDisplayNameBlur}
                placeholder={t.displayNamePlaceholder}
              />
            </div>
          </section>
        )}

        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <h3>{t.prefsTitle}</h3>
              <p>{t.prefsDesc}</p>
            </div>
          </div>

          <div className="settings-two-cols">
            <div className="settings-field">
              <label>{t.themeLabel}</label>
              <div className="settings-theme-options">
                <button
                  type="button"
                  className={
                    "settings-chip" + (settings.theme === "dark" ? " active" : "")
                  }
                  onClick={() => {
                    updateSetting("theme", "dark");
                    triggerSaved();
                  }}
                >
                  {t.themeOptionDark}
                </button>
                <button
                  type="button"
                  className={
                    "settings-chip" +
                    (settings.theme === "light" ? " active" : "")
                  }
                  onClick={() => {
                    updateSetting("theme", "light");
                    triggerSaved();
                  }}
                >
                  {t.themeOptionLight}
                </button>
                <button
                  type="button"
                  className={
                    "settings-chip" +
                    (settings.theme === "system" ? " active" : "")
                  }
                  onClick={() => {
                    updateSetting("theme", "system");
                    triggerSaved();
                  }}
                >
                  {t.themeOptionSystem}
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="language">{t.languageLabel}</label>
              <select
                id="language"
                value={currentLang}
                onChange={handleLanguageChange}
              >
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="it">Italiano</option>
                <option value="ru">Русский</option>
              </select>
            </div>
          </div>
        </section>

        {!isModerator && (
          <section className="settings-card settings-card-full">
            <div className="settings-card-header">
              <div>
                <h3>{t.notifTitle}</h3>
                <p>{t.notifDesc}</p>
              </div>
            </div>

            <div className="settings-toggle-list">
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.mainEmail ?? true}
                  onChange={handleMainEmailChange}
                />
                <div className="settings-toggle-text">
                  <span>{t.mainEmailLabel}</span>
                  <small>{t.mainEmailSub}</small>
                </div>
              </label>

              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.weeklySummary ?? false}
                  onChange={handleWeeklyChange}
                />
                <div className="settings-toggle-text">
                  <span>{t.weeklyLabel}</span>
                  <small>{t.weeklySub}</small>
                </div>
              </label>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
