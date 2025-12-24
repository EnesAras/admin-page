// src/pages/SettingsPage.jsx
import { useState, useEffect } from "react";
import "./SettingsPage.css";
import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";

const translations = {
  en: {
    settingsTitle: "Settings",
    settingsSubtitle: "Manage your profile, preferences and notifications.",
    accountTitle: "Account & Security",
    accountSubtitle: "View your account details and reset credentials.",
    previewTitle: "Account preview",
    previewSubtitle: "Quick summary of your current setup.",
    previewDisplayName: "Display name",
    previewLanguage: "Language",
    previewTheme: "Theme",
    resetPassword: "Reset password",
    dangerTitle: "Danger zone",
    dangerSubtitle: "Use with caution. These actions cannot be undone.",
    clearLocalData: "Clear cached data",
    resetPreferences: "Reset preferences",
    emailLabel: "Email",
    roleLabel: "Role",
    settingsOptionSystem: "System",

    profileTitle: "Profile",
    profileDesc: "Update how your name appears in the admin panel.",
    displayNameLabel: "Display name",
    displayNamePlaceholder: "Your name",

    prefsTitle: "Preferences",
    prefsDesc: "Choose your visual theme and interface language.",
    themeLabel: "Theme",
    themeSystemHint: "System follows your OS color preference.",
    themeSystemStatusDark: "Your OS is currently using dark mode.",
    themeSystemStatusLight: "Your OS is currently using light mode.",
    themeSystemAction: "Sync with OS",
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
    accountTitle: "Hesap ve Güvenlik",
    accountSubtitle: "Hesap bilgilerini gör ve kimlik bilgilerini sıfırla.",
    previewTitle: "Hesap önizlemesi",
    previewSubtitle: "Güncel ayarlarının hızlı özeti.",
    previewDisplayName: "Görünen ad",
    previewLanguage: "Dil",
    previewTheme: "Tema",
    resetPassword: "Şifre sıfırla",
    dangerTitle: "Tehlikeli alan",
    dangerSubtitle: "Dikkatli ol; bu eylemler geri alınamaz.",
    clearLocalData: "Önbelleği temizle",
    resetPreferences: "Tercihleri sıfırla",
    emailLabel: "E-posta",
    roleLabel: "Rol",
    settingsOptionSystem: "Sistem",

    profileTitle: "Profil",
    profileDesc: "Panelde görünen adını güncelle.",
    displayNameLabel: "Görünen ad",
    displayNamePlaceholder: "Adın",

    prefsTitle: "Tercihler",
    prefsDesc: "Tema ve arayüz dilini seç.",
    themeLabel: "Tema",
    themeSystemHint: "Sistem, işletim sisteminin renk tercihlerini takip eder.",
    themeSystemStatusDark: "İşletim sistemin şu anda koyu modda.",
    themeSystemStatusLight: "İşletim sistemin şu anda açık modda.",
    themeSystemAction: "OS ile eşitle",
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
    accountTitle: "Konto & Sicherheit",
    accountSubtitle: "Kontodetails ansehen und Zugangsdaten zurücksetzen.",
    previewTitle: "Kontoüberblick",
    previewSubtitle: "Kurzer Überblick über deine aktuellen Einstellungen.",
    previewDisplayName: "Anzeigename",
    previewLanguage: "Sprache",
    previewTheme: "Theme",
    resetPassword: "Passwort zurücksetzen",
    dangerTitle: "Gefahrenzone",
    dangerSubtitle: "Ergebnis: irreversible Aktionen.",
    clearLocalData: "Cache löschen",
    resetPreferences: "Einstellungen zurücksetzen",
    emailLabel: "E-Mail",
    roleLabel: "Rolle",
    settingsOptionSystem: "System",

    profileTitle: "Profil",
    profileDesc: "Aktualisiere, wie dein Name im Admin-Panel angezeigt wird.",
    displayNameLabel: "Anzeigename",
    displayNamePlaceholder: "Dein Name",

    prefsTitle: "Präferenzen",
    prefsDesc: "Wähle Thema und Sprache der Oberfläche.",
    themeLabel: "Theme",
    themeSystemHint: "System passt sich der OS-Farbpalette an.",
    themeSystemStatusDark: "Dein OS verwendet derzeit den Dunkelmodus.",
    themeSystemStatusLight: "Dein OS verwendet derzeit den Hellmodus.",
    themeSystemAction: "Mit OS synchronisieren",
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
    accountTitle: "Cuenta y seguridad",
    accountSubtitle: "Consulta tus datos y restablece credenciales.",
    previewTitle: "Resumen de la cuenta",
    previewSubtitle: "Vista rápida de tus ajustes actuales.",
    previewDisplayName: "Nombre visible",
    previewLanguage: "Idioma",
    previewTheme: "Tema",
    resetPassword: "Restablecer contraseña",
    dangerTitle: "Zona de riesgo",
    dangerSubtitle: "Usa con cuidado, no se puede deshacer.",
    clearLocalData: "Borrar caché",
    resetPreferences: "Restablecer preferencias",
    emailLabel: "Correo",
    roleLabel: "Rol",
    settingsOptionSystem: "Sistema",

    profileTitle: "Perfil",
    profileDesc: "Actualiza cómo aparece tu nombre en el panel.",
    displayNameLabel: "Nombre visible",
    displayNamePlaceholder: "Tu nombre",

    prefsTitle: "Preferencias",
    prefsDesc: "Elige tema visual e idioma de la interfaz.",
    themeLabel: "Tema",
    themeSystemHint: "Sistema sigue la preferencia de color de tu SO.",
    themeSystemStatusDark: "Tu SO está usando el modo oscuro actualmente.",
    themeSystemStatusLight: "Tu SO está usando el modo claro actualmente.",
    themeSystemAction: "Sincronizar con el SO",
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
    themeSystemHint: "Système suit la préférence de couleur de ton OS.",
    themeSystemStatusDark: "Ton OS utilise actuellement le mode sombre.",
    themeSystemStatusLight: "Ton OS utilise actuellement le mode clair.",
    themeSystemAction: "Synchroniser avec l’OS",
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
    accountTitle: "Compte et sécurité",
    accountSubtitle: "Consulte tes données et réinitialise les identifiants.",
    previewTitle: "Aperçu du compte",
    previewSubtitle: "Résumé rapide de tes réglages actuels.",
    previewDisplayName: "Nom affiché",
    previewLanguage: "Langue",
    previewTheme: "Thème",
    resetPassword: "Réinitialiser le mot de passe",
    dangerTitle: "Zone dangereuse",
    dangerSubtitle: "Actions irréversibles, fais attention.",
    clearLocalData: "Effacer les données locales",
    resetPreferences: "Réinitialiser les préférences",
    emailLabel: "Email",
    roleLabel: "Rôle",
    settingsOptionSystem: "Système",
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
    themeSystemHint: "Sistema segue le preferenze di colore del tuo OS.",
    themeSystemStatusDark: "Il tuo sistema usa attualmente la modalità scura.",
    themeSystemStatusLight: "Il tuo sistema usa attualmente la modalità chiara.",
    themeSystemAction: "Sincronizza con il sistema",
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
    accountTitle: "Account e sicurezza",
    accountSubtitle: "Controlla i tuoi dati e reimposta le credenziali.",
    previewTitle: "Anteprima account",
    previewSubtitle: "Riepilogo rapido delle tue impostazioni.",
    previewDisplayName: "Nome visualizzato",
    previewLanguage: "Lingua",
    previewTheme: "Tema",
    resetPassword: "Reimposta password",
    dangerTitle: "Zona pericolosa",
    dangerSubtitle: "Usa con cautela, operazioni irreversibili.",
    clearLocalData: "Cancella dati locali",
    resetPreferences: "Reimposta preferenze",
    emailLabel: "Email",
    roleLabel: "Ruolo",
    settingsOptionSystem: "Sistema",
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
    themeSystemHint: "Система следует настройкам цвета ОС.",
    themeSystemStatusDark: "Ваша ОС сейчас использует тёмный режим.",
    themeSystemStatusLight: "Ваша ОС сейчас использует светлый режим.",
    themeSystemAction: "Синхронизировать с ОС",
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
    accountTitle: "Аккаунт и безопасность",
    accountSubtitle: "Проверь данные и сбрось доступ.",
    previewTitle: "Обзор аккаунта",
    previewSubtitle: "Краткий взгляд на ваши настройки.",
    previewDisplayName: "Отображаемое имя",
    previewLanguage: "Язык",
    previewTheme: "Тема",
    resetPassword: "Сбросить пароль",
    dangerTitle: "Опасная зона",
    dangerSubtitle: "Действия необратимы.",
    clearLocalData: "Очистить кеш",
    resetPreferences: "Сбросить настройки",
    emailLabel: "Электронная почта",
    roleLabel: "Роль",
    settingsOptionSystem: "Система",
  },
};

function SettingsPage() {
  const { settings, updateSetting, refreshSystemPreference, osPrefersDark } =
    useSettings();
  const { currentUser, updateCurrentUser } = useAuth();
  const [displayName, setDisplayName] = useState(
    currentUser?.name || settings.displayName || ""
  );
  const [showSaved, setShowSaved] = useState(false);
  const isModerator =
    String(currentUser?.role || "").trim().toLowerCase() === "moderator";

  const currentLang = settings.language || "en";
  const dict = translations[currentLang] || translations.en;
  const t = (key, fallback) => {
    if (dict && dict[key] !== undefined) return dict[key];
    if (translations.en && translations.en[key] !== undefined) return translations.en[key];
    if (fallback !== undefined) return fallback;
    return key;
  };

  const showSystemNote = settings.theme === "system";
  const triggerSaved = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1500);
  };

  const handleLanguageChange = (e) => {
    updateSetting("language", e.target.value);
    triggerSaved();
  };

  const handleSystemSync = () => {
    updateSetting("theme", "system");
    refreshSystemPreference();
    triggerSaved();
  };

  const handleDisplayNameBlur = () => {
    const trimmed = displayName.trim();
    if (trimmed && trimmed !== currentUser?.name) {
      updateCurrentUser({ name: trimmed });
      updateSetting("displayName", trimmed);
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
    setDisplayName(
      currentUser?.name || settings.displayName || ""
    );
  }, [currentUser?.name, settings.displayName]);

  return (
    <div className="settings-container">
      <div className="settings-header page-header">
        <div className="page-header-main">
          <span className="page-header-icon" aria-hidden="true">
            ⚙️
          </span>
          <div>
            <p className="page-header-title">
              {t("settingsTitle", "Settings")}
            </p>
            <span className="page-header-caption">
              {t(
                "settingsSubtitle",
                "Manage your profile, preferences and notifications."
              )}
            </span>
          </div>
        </div>

        {showSaved && (
        <div className="settings-saved-pill">
          {t("savedPill", "Settings saved")}
        </div>
        )}
      </div>

      {isModerator && (
        <section className="settings-moderator-note">
          <p className="settings-moderator-title">
            {t("moderatorTitle", "Limited control mode")}
          </p>
          <p className="settings-moderator-subtitle">
            {t(
              "moderatorSubtitle",
              "Theme and language settings are the only available preferences."
            )}
          </p>
        </section>
      )}

      <div className="settings-grid">
        {!isModerator && (
          <section className="settings-card">
            <div className="settings-card-header">
              <div>
                <h3>{t("profileTitle", "Profile")}</h3>
                <p>
                  {t(
                    "profileDesc",
                    "Update how your name appears in the admin panel."
                  )}
                </p>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="displayName">
                {t("displayNameLabel", "Display name")}
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onBlur={handleDisplayNameBlur}
                placeholder={t("displayNamePlaceholder", "Your name")}
              />
            </div>
          </section>
        )}

        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <h3>{t("prefsTitle", "Preferences")}</h3>
              <p>{t("prefsDesc", "Choose your visual theme and interface language.")}</p>
            </div>
          </div>

          <div className="settings-two-cols">
            <div className="settings-field">
              <label>{t("themeLabel", "Theme")}</label>
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
                  {t("themeOptionDark", "Dark")}
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
                  {t("themeOptionLight", "Light")}
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
                  {t("themeOptionSystem", "System")}
                </button>
              </div>
              {showSystemNote && (
                <div className="settings-theme-note">
                  <span>
                    {t(
                      "themeSystemHint",
                      "System follows your OS color preference."
                    )}
                  </span>
                  <span className="settings-theme-status">
                    {osPrefersDark
                      ? t(
                          "themeSystemStatusDark",
                          "Your OS is currently using dark mode."
                        )
                      : t(
                          "themeSystemStatusLight",
                          "Your OS is currently using light mode."
                        )}
                  </span>
                  <button
                    type="button"
                    className="settings-theme-sync"
                    onClick={handleSystemSync}
                  >
                    {t("themeSystemAction", "Sync with OS")}
                  </button>
                </div>
              )}
            </div>

            <div className="settings-field">
              <label htmlFor="language">
                {t("languageLabel", "Language")}
              </label>
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
                <h3>{t("notifTitle", "Notifications")}</h3>
                <p>
                  {t(
                    "notifDesc",
                    "Control which email updates you receive about activity."
                  )}
                </p>
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
                  <span>{t("mainEmailLabel", "Main email alerts")}</span>
                  <small>
                    {t(
                      "mainEmailSub",
                      "Order updates, critical account messages."
                    )}
                  </small>
                </div>
              </label>

              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.weeklySummary ?? false}
                  onChange={handleWeeklyChange}
                />
                <div className="settings-toggle-text">
                  <span>{t("weeklyLabel", "Weekly summary")}</span>
                  <small>
                    {t(
                      "weeklySub",
                      "Get a weekly summary of users and orders."
                    )}
                  </small>
                </div>
              </label>
            </div>
          </section>
        )}
      </div>

      <div className="settings-aux-grid">
        <section className="settings-summary-card">
          <div className="settings-card-header">
            <div>
              <h3>{t("previewTitle", "Account preview")}</h3>
              <p>
                {t(
                  "previewSubtitle",
                  "Quick summary of your current setup."
                )}
              </p>
            </div>
          </div>
          <p>
            <strong>{t("previewDisplayName", "Display name")}: </strong>
            {displayName || currentUser?.name || "—"}
          </p>
          <p>
            <strong>{t("previewLanguage", "Language")}: </strong>
            {(settings.language || "en").toUpperCase()}
          </p>
          <p>
            <strong>{t("previewTheme", "Theme")}: </strong>
            {settings.theme || t("settingsOptionSystem", "System")}
          </p>
        </section>

        <section className="settings-card">
          <div className="settings-card-header">
            <div>
            <h3>{t("accountTitle", "Account & Security")}</h3>
            <p>
              {t(
                "accountSubtitle",
                "View your account details and reset credentials."
              )}
            </p>
            </div>
          </div>
          <div className="settings-field">
            <label>{t("settings.emailLabel", "Email")}</label>
            <input value={currentUser?.email || ""} readOnly />
          </div>
          <div className="settings-field">
            <label>{t("settings.roleLabel", "Role")}</label>
            <input value={currentUser?.role || ""} readOnly />
          </div>
          <button type="button" className="settings-secondary-btn">
            {t("resetPassword", "Reset password")}
          </button>
        </section>
      </div>

      <section className="settings-card settings-danger-card">
        <div className="settings-card-header">
          <div>
            <h3>{t("dangerTitle", "Danger zone")}</h3>
            <p>
              {t(
                "dangerSubtitle",
                "Use with caution. These actions cannot be undone."
              )}
            </p>
          </div>
        </div>
        <button type="button" className="settings-danger-btn">
          {t("clearLocalData", "Clear cached data")}
        </button>
        <button type="button" className="settings-secondary-btn">
          {t("resetPreferences", "Reset preferences")}
        </button>
      </section>
    </div>
  );
}

export default SettingsPage;
