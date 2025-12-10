// src/pages/DashboardPage.jsx
import { useState } from "react";
import "./DashboardPage.css";
import { useSettings } from "../context/SettingsContext";

const fallbackUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "johndoe36@kars.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "janesmith36@kars.com",
    role: "User",
    status: "Inactive",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mikejohnson36@kars.com",
    role: "Moderator",
    status: "Active",
  },
];

const TRANSLATIONS = {
  en: {
    dashboardTitle: "Dashboard",
    dashboardSubtitle: "Quick overview of your users and activity.",

    cardTotalUsers: "Total Users",
    cardActiveUsers: "Active Users",
    cardInactiveUsers: "Inactive Users",
    cardAdmins: "Admins",

    cardFootActiveRate: "Active rate",
    cardFootActiveUsers: "Users with status “Active”",
    cardFootInactiveUsers: "Users currently inactive",
    cardFootAdmins: "Users with Admin role",

    recentTitle: "Recent Users",
    recentSubtitle: "latest users",
    recentEmpty:
      "No users found. Go to the Users page to add your first user.",

    thName: "Name",
    thEmail: "Email",
    thRole: "Role",
    thStatus: "Status",

    roleAdmin: "Admin",
    roleModerator: "Moderator",
    roleUser: "User",

    statusActive: "Active",
    statusInactive: "Inactive",
  },
  tr: {
    dashboardTitle: "Panel",
    dashboardSubtitle: "Kullanıcılar ve aktiviteler için hızlı özet.",

    cardTotalUsers: "Toplam Kullanıcı",
    cardActiveUsers: "Aktif Kullanıcı",
    cardInactiveUsers: "Pasif Kullanıcı",
    cardAdmins: "Yöneticiler",

    cardFootActiveRate: "Aktif oranı",
    cardFootActiveUsers: "Durumu “Aktif” olan kullanıcılar",
    cardFootInactiveUsers: "Şu anda pasif kullanıcılar",
    cardFootAdmins: "Admin rolüne sahip kullanıcılar",

    recentTitle: "Son Kullanıcılar",
    recentSubtitle: "son kullanıcı",
    recentEmpty:
      "Hiç kullanıcı bulunamadı. Kullanıcı eklemek için Users sayfasına gidin.",

    thName: "İsim",
    thEmail: "E-posta",
    thRole: "Rol",
    thStatus: "Durum",

    roleAdmin: "Admin",
    roleModerator: "Moderatör",
    roleUser: "Kullanıcı",

    statusActive: "Aktif",
    statusInactive: "Pasif",
  },
  de: {
    dashboardTitle: "Dashboard",
    dashboardSubtitle: "Schneller Überblick über deine Nutzer und Aktivität.",

    cardTotalUsers: "Gesamtbenutzer",
    cardActiveUsers: "Aktive Benutzer",
    cardInactiveUsers: "Inaktive Benutzer",
    cardAdmins: "Admins",

    cardFootActiveRate: "Aktiv-Rate",
    cardFootActiveUsers: "Benutzer mit Status „Aktiv“",
    cardFootInactiveUsers: "Benutzer derzeit inaktiv",
    cardFootAdmins: "Benutzer mit Admin-Rolle",

    recentTitle: "Neueste Benutzer",
    recentSubtitle: "letzte Benutzer",
    recentEmpty:
      "Keine Benutzer gefunden. Füge deinen ersten Benutzer auf der Users-Seite hinzu.",

    thName: "Name",
    thEmail: "E-Mail",
    thRole: "Rolle",
    thStatus: "Status",

    roleAdmin: "Admin",
    roleModerator: "Moderator",
    roleUser: "Benutzer",

    statusActive: "Aktiv",
    statusInactive: "Inaktiv",
  },
  es: {
    dashboardTitle: "Panel",
    dashboardSubtitle: "Resumen rápido de tus usuarios y actividad.",

    cardTotalUsers: "Usuarios Totales",
    cardActiveUsers: "Usuarios Activos",
    cardInactiveUsers: "Usuarios Inactivos",
    cardAdmins: "Administradores",

    cardFootActiveRate: "Tasa de actividad",
    cardFootActiveUsers: "Usuarios con estado “Activo”",
    cardFootInactiveUsers: "Usuarios actualmente inactivos",
    cardFootAdmins: "Usuarios con rol de Admin",

    recentTitle: "Usuarios Recientes",
    recentSubtitle: "últimos usuarios",
    recentEmpty:
      "No se encontraron usuarios. Ve a la página de Users para añadir tu primer usuario.",

    thName: "Nombre",
    thEmail: "Correo",
    thRole: "Rol",
    thStatus: "Estado",

    roleAdmin: "Admin",
    roleModerator: "Moderador",
    roleUser: "Usuario",

    statusActive: "Activo",
    statusInactive: "Inactivo",
  },
  fr: {
    dashboardTitle: "Tableau de bord",
    dashboardSubtitle:
      "Aperçu rapide de vos utilisateurs et de leur activité.",

    cardTotalUsers: "Utilisateurs totaux",
    cardActiveUsers: "Utilisateurs actifs",
    cardInactiveUsers: "Utilisateurs inactifs",
    cardAdmins: "Administrateurs",

    cardFootActiveRate: "Taux d'activité",
    cardFootActiveUsers: "Utilisateurs avec le statut « Actif »",
    cardFootInactiveUsers: "Utilisateurs actuellement inactifs",
    cardFootAdmins: "Utilisateurs avec le rôle Admin",

    recentTitle: "Utilisateurs récents",
    recentSubtitle: "derniers utilisateurs",
    recentEmpty:
      "Aucun utilisateur trouvé. Allez sur la page Users pour ajouter votre premier utilisateur.",

    thName: "Nom",
    thEmail: "E-mail",
    thRole: "Rôle",
    thStatus: "Statut",

    roleAdmin: "Admin",
    roleModerator: "Modérateur",
    roleUser: "Utilisateur",

    statusActive: "Actif",
    statusInactive: "Inactif",
  },
  it: {
    dashboardTitle: "Dashboard",
    dashboardSubtitle:
      "Panoramica rapida dei tuoi utenti e della loro attività.",

    cardTotalUsers: "Utenti totali",
    cardActiveUsers: "Utenti attivi",
    cardInactiveUsers: "Utenti inattivi",
    cardAdmins: "Amministratori",

    cardFootActiveRate: "Tasso di attività",
    cardFootActiveUsers: "Utenti con stato “Attivo”",
    cardFootInactiveUsers: "Utenti attualmente inattivi",
    cardFootAdmins: "Utenti con ruolo Admin",

    recentTitle: "Utenti recenti",
    recentSubtitle: "ultimi utenti",
    recentEmpty:
      "Nessun utente trovato. Vai alla pagina Users per aggiungere il tuo primo utente.",

    thName: "Nome",
    thEmail: "Email",
    thRole: "Ruolo",
    thStatus: "Stato",

    roleAdmin: "Admin",
    roleModerator: "Moderatore",
    roleUser: "Utente",

    statusActive: "Attivo",
    statusInactive: "Inattivo",
  },
  ru: {
    dashboardTitle: "Панель",
    dashboardSubtitle: "Быстрый обзор ваших пользователей и активности.",

    cardTotalUsers: "Всего пользователей",
    cardActiveUsers: "Активные пользователи",
    cardInactiveUsers: "Неактивные пользователи",
    cardAdmins: "Администраторы",

    cardFootActiveRate: "Доля активных",
    cardFootActiveUsers: "Пользователи со статусом «Активен»",
    cardFootInactiveUsers: "Пользователи, которые сейчас неактивны",
    cardFootAdmins: "Пользователи с ролью Admin",

    recentTitle: "Недавние пользователи",
    recentSubtitle: "последние пользователи",
    recentEmpty:
      "Пользователи не найдены. Перейдите на страницу Users, чтобы добавить первого пользователя.",

    thName: "Имя",
    thEmail: "E-mail",
    thRole: "Роль",
    thStatus: "Статус",

    roleAdmin: "Админ",
    roleModerator: "Модератор",
    roleUser: "Пользователь",

    statusActive: "Активен",
    statusInactive: "Неактивен",
  },
};

function DashboardPage() {
  const { language } = useSettings();

  const currentLang = language || "en";

  const [users] = useState(() => {
    const stored = localStorage.getItem("admin_users");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : fallbackUsers;
      } catch {
        return fallbackUsers;
      }
    }
    return fallbackUsers;
  });

  const langKey = TRANSLATIONS[currentLang] ? currentLang : "en";
  const t = (key) =>
    TRANSLATIONS[langKey][key] ?? TRANSLATIONS.en[key] ?? key;

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const inactiveUsers = totalUsers - activeUsers;
  const adminCount = users.filter((u) => u.role === "Admin").length;

  const activeRate =
    totalUsers === 0 ? 0 : Math.round((activeUsers / totalUsers) * 100);

  const rolePriority = {
    Admin: 1,
    Moderator: 2,
    User: 3,
  };

  const recentUsers = [...users]
    .sort((a, b) => {
      if (rolePriority[a.role] !== rolePriority[b.role]) {
        return rolePriority[a.role] - rolePriority[b.role];
      }
      return b.id - a.id;
    })
    .slice(0, 5);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">{t("dashboardTitle")}</h2>
      <p className="dashboard-subtitle">{t("dashboardSubtitle")}</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <p className="card-label">{t("cardTotalUsers")}</p>
          <p className="card-number">{totalUsers}</p>
          <p className="card-foot">
            {t("cardFootActiveRate")} <span>{activeRate}%</span>
          </p>
        </div>

        <div className="dashboard-card">
          <p className="card-label">{t("cardActiveUsers")}</p>
          <p className="card-number text-green">{activeUsers}</p>
          <p className="card-foot subtle">{t("cardFootActiveUsers")}</p>
        </div>

        <div className="dashboard-card">
          <p className="card-label">{t("cardInactiveUsers")}</p>
          <p className="card-number text-amber">{inactiveUsers}</p>
          <p className="card-foot subtle">{t("cardFootInactiveUsers")}</p>
        </div>

        <div className="dashboard-card">
          <p className="card-label">{t("cardAdmins")}</p>
          <p className="card-number text-sky">{adminCount}</p>
          <p className="card-foot subtle">{t("cardFootAdmins")}</p>
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="recent-users">
          <div className="recent-header">
            <h3>{t("recentTitle")}</h3>
            <span>
              {recentUsers.length} {t("recentSubtitle")}
            </span>
          </div>

          {recentUsers.length === 0 ? (
            <p className="recent-empty">{t("recentEmpty")}</p>
          ) : (
            <table className="recent-table">
              <thead>
                <tr>
                  <th>{t("thName")}</th>
                  <th>{t("thEmail")}</th>
                  <th>{t("thRole")}</th>
                  <th>{t("thStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => {
                  let roleKey = "roleUser";
                  if (user.role === "Admin") roleKey = "roleAdmin";
                  else if (user.role === "Moderator")
                    roleKey = "roleModerator";

                  const statusKey =
                    user.status === "Active"
                      ? "statusActive"
                      : "statusInactive";

                  return (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td className="recent-email">{user.email}</td>
                      <td>
                        <span
                          className={`role-badge role-${String(
                            user.role
                          ).toLowerCase()}`}
                        >
                          {t(roleKey)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge status-${String(
                            user.status
                          ).toLowerCase()}`}
                        >
                          {t(statusKey)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
