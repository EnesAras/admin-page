// src/pages/DashboardPage.jsx
import { useState } from "react";
import "./DashboardPage.css";
import { useSettings } from "../context/SettingsContext";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ------------------- FALLBACK ORDERS ------------------- */
const fallbackOrders = [
  {
    id: 101,
    customer: "Alex Turner",
    email: "alex.turner@example.com",
    date: "2025-10-15",
    total: 125.5,
    status: "Pending",
    method: "Credit Card",
  },
  {
    id: 102,
    customer: "Maria Lopez",
    email: "maria.lopez@example.com",
    date: "2025-11-03",
    total: 89.99,
    status: "Shipped",
    method: "PayPal",
  },
  {
    id: 103,
    customer: "David Kim",
    email: "david.kim@example.com",
    date: "2025-12-05",
    total: 42.0,
    status: "Cancelled",
    method: "Bank Transfer",
  },
];

/* ------------------- ORDER DASHBOARD TEXTS ------------------- */

const dashboardOrderTexts = {
  en: {
    ordersStatsTitle: "Orders overview",
    totalOrders: "Total orders",
    pendingOrders: "Pending",
    shippedOrders: "Shipped",
    totalRevenue: "Total revenue",
    recentOrdersTitle: "Recent Orders",
    latestOrdersLabel: "Latest {count} orders",
    recentOrdersEmpty: "No recent orders found.",
    thId: "ID",
    thCustomer: "Customer",
    thTotal: "Total",
    thStatus: "Status",
  },
  tr: {
    ordersStatsTitle: "Sipariş özeti",
    totalOrders: "Toplam sipariş",
    pendingOrders: "Beklemede",
    shippedOrders: "Gönderilen",
    totalRevenue: "Toplam gelir",
    recentOrdersTitle: "Son Siparişler",
    latestOrdersLabel: "Son {count} sipariş",
    recentOrdersEmpty: "Son sipariş bulunamadı.",
    thId: "ID",
    thCustomer: "Müşteri",
    thTotal: "Tutar",
    thStatus: "Durum",
  },
  de: {
    ordersStatsTitle: "Bestellübersicht",
    totalOrders: "Gesamtbestellungen",
    pendingOrders: "Offen",
    shippedOrders: "Versendet",
    totalRevenue: "Gesamtumsatz",
    recentOrdersTitle: "Letzte Bestellungen",
    latestOrdersLabel: "Letzte {count} Bestellungen",
    recentOrdersEmpty: "Keine letzten Bestellungen gefunden.",
    thId: "ID",
    thCustomer: "Kunde",
    thTotal: "Summe",
    thStatus: "Status",
  },
  es: {
    ordersStatsTitle: "Resumen de pedidos",
    totalOrders: "Pedidos totales",
    pendingOrders: "Pendientes",
    shippedOrders: "Enviados",
    totalRevenue: "Ingresos totales",
    recentOrdersTitle: "Pedidos recientes",
    latestOrdersLabel: "Últimos {count} pedidos",
    recentOrdersEmpty: "No se encontraron pedidos recientes.",
    thId: "ID",
    thCustomer: "Cliente",
    thTotal: "Total",
    thStatus: "Estado",
  },
  fr: {
    ordersStatsTitle: "Vue d'ensemble des commandes",
    totalOrders: "Commandes totales",
    pendingOrders: "En attente",
    shippedOrders: "Expédiées",
    totalRevenue: "Revenu total",
    recentOrdersTitle: "Commandes récentes",
    latestOrdersLabel: "{count} dernières commandes",
    recentOrdersEmpty: "Aucune commande récente trouvée.",
    thId: "ID",
    thCustomer: "Client",
    thTotal: "Total",
    thStatus: "Statut",
  },
  it: {
    ordersStatsTitle: "Panoramica ordini",
    totalOrders: "Ordini totali",
    pendingOrders: "In attesa",
    shippedOrders: "Spediti",
    totalRevenue: "Entrate totali",
    recentOrdersTitle: "Ordini recenti",
    latestOrdersLabel: "Ultimi {count} ordini",
    recentOrdersEmpty: "Nessun ordine recente trovato.",
    thId: "ID",
    thCustomer: "Cliente",
    thTotal: "Totale",
    thStatus: "Stato",
  },
  ru: {
    ordersStatsTitle: "Обзор заказов",
    totalOrders: "Всего заказов",
    pendingOrders: "В ожидании",
    shippedOrders: "Отправленные",
    totalRevenue: "Общая выручка",
    recentOrdersTitle: "Последние заказы",
    latestOrdersLabel: "Последние {count} заказов",
    recentOrdersEmpty: "Последние заказы не найдены.",
    thId: "ID",
    thCustomer: "Клиент",
    thTotal: "Сумма",
    thStatus: "Статус",
  },
};

/* ------------------- SIMPLE STATUS LABELS (ORDERS) ------------------- */

const orderStatusLabels = {
  en: {
    Pending: "Pending",
    Shipped: "Shipped",
    Cancelled: "Cancelled",
  },
  tr: {
    Pending: "Beklemede",
    Shipped: "Gönderildi",
    Cancelled: "İptal edildi",
  },
  de: {
    Pending: "Ausstehend",
    Shipped: "Versendet",
    Cancelled: "Storniert",
  },
  es: {
    Pending: "Pendiente",
    Shipped: "Enviado",
    Cancelled: "Cancelado",
  },
  fr: {
    Pending: "En attente",
    Shipped: "Expédiée",
    Cancelled: "Annulée",
  },
  it: {
    Pending: "In attesa",
    Shipped: "Spedito",
    Cancelled: "Annullato",
  },
  ru: {
    Pending: "В ожидании",
    Shipped: "Отправлен",
    Cancelled: "Отменён",
  },
};

/* ------------------- STATUS COLORS (CHART) ------------------- */

const STATUS_COLORS = {
  Pending: "#fbbf24",
  Shipped: "#22c55e",
  Cancelled: "#f97373",
};

/* ------------------- FALLBACK USERS ------------------- */

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

/* ------------------- UI TEXTS (USERS) ------------------- */

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
// Pie chart için özel tooltip
function StatusTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0];

  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{item.name}</div>
      <div className="chart-tooltip-value">{item.value} orders</div>
    </div>
  );
}

/* ------------------- COMPONENT ------------------- */

function DashboardPage() {
  const { language } = useSettings();
  const currentLang = language || "en";

  /* ---- Users texts ---- */

  const langKey = TRANSLATIONS[currentLang] ? currentLang : "en";
  const t = (key) =>
    TRANSLATIONS[langKey][key] ?? TRANSLATIONS.en[key] ?? key;

  /* ---- Users data ---- */

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

  /* ---- Orders texts ---- */

  const orderTexts =
    dashboardOrderTexts[currentLang] || dashboardOrderTexts.en;
  const orderStatusMap =
    orderStatusLabels[currentLang] || orderStatusLabels.en;

  /* ---- Orders data ---- */

  const [orders] = useState(() => {
    const stored = localStorage.getItem("admin_orders");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // ignore, fallback below
      }
    }
    return fallbackOrders;
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const shippedOrders = orders.filter((o) => o.status === "Shipped").length;
  const cancelledOrders = orders.filter(
    (o) => o.status === "Cancelled"
  ).length;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  // ---- Aylık gelir datası (line chart için) ----
  const monthlyRevenueMap = new Map();

  orders.forEach((order) => {
    if (!order.date) return;
    const d = new Date(order.date);
    if (isNaN(d)) return;

    const month = d.getMonth(); // 0-11
    const year = d.getFullYear();
    const sortKey = year * 100 + month;
    const label = d.toLocaleString("en-US", { month: "short" });

    const key = `${year}-${month}`;

    const existing = monthlyRevenueMap.get(key) || {
      label,
      sortKey,
      revenue: 0,
    };

    existing.revenue += order.total || 0;
    monthlyRevenueMap.set(key, existing);
  });

  const revenueData = Array.from(monthlyRevenueMap.values()).sort(
    (a, b) => a.sortKey - b.sortKey
  );

  // ---- Order status dağılımı (pie chart için) ----
  const statusChartData = [
    {
      key: "Pending",
      label: orderStatusMap.Pending || "Pending",
      value: pendingOrders,
    },
    {
      key: "Shipped",
      label: orderStatusMap.Shipped || "Shipped",
      value: shippedOrders,
    },
    {
      key: "Cancelled",
      label: orderStatusMap.Cancelled || "Cancelled",
      value: cancelledOrders,
    },
  ].filter((item) => item.value > 0);

  const hasStatusData = statusChartData.length > 0;

  /* ------------------- RENDER ------------------- */

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">{t("dashboardTitle")}</h2>
      <p className="dashboard-subtitle">{t("dashboardSubtitle")}</p>

      {/* USER STATS */}
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

      {/* ORDER STATS (2. satır kartlar) */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <p className="card-label">{orderTexts.totalOrders}</p>
          <p className="card-number">{totalOrders}</p>
        </div>

        <div className="dashboard-card">
          <p className="card-label">{orderTexts.pendingOrders}</p>
          <p className="card-number text-amber">{pendingOrders}</p>
        </div>

        <div className="dashboard-card">
          <p className="card-label">{orderTexts.shippedOrders}</p>
          <p className="card-number text-green">{shippedOrders}</p>
        </div>

        <div className="dashboard-card">
          <p className="card-label">{orderTexts.totalRevenue}</p>
          <p className="card-number text-green">
            €{totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* REVENUE LINE CHART */}
      <section className="dashboard-chart-card">
        <div className="chart-header">
          <div>
            <h3>Revenue overview</h3>
            <p>Last 6 months total revenue (€)</p>
          </div>
          <span className="chart-badge">Live demo</span>
        </div>

        <div className="chart-wrapper">
          {revenueData.length === 0 ? (
            <p className="chart-empty">Not enough data to display.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={revenueData}
                margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#111827" />
                <XAxis dataKey="label" stroke="#6b7280" tickLine={false} />
                <YAxis stroke="#6b7280" tickLine={false} />
             <Tooltip content={<StatusTooltip />} />


                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ORDER STATUS PIE CHART */}
      <section className="dashboard-chart-card">
        <div className="chart-header">
          <div>
            <h3>Order status distribution</h3>
            <p>Breakdown of Pending, Shipped and Cancelled orders</p>
          </div>
        </div>

        <div className="chart-wrapper">
          {!hasStatusData ? (
            <p className="chart-empty">No orders to display.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {statusChartData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={STATUS_COLORS[entry.key] || "#6b7280"}
                    />
                  ))}
                </Pie>

                {/* BURASI ÖNEMLİ: TOOLTIP */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1f2937",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#9ca3af" }}
                  itemStyle={{ color: "#e5e7eb" }}   // yazıyı açtık
                  formatter={(value, name) => [
                    `${value} orders`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>


      {/* BOTTOM SECTION: RECENT USERS + RECENT ORDERS */}
      <div className="dashboard-bottom">
        {/* Recent Users */}
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
                  else if (user.role === "Moderator") roleKey = "roleModerator";

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

        {/* Recent Orders */}
        <div className="recent-users">
          <div className="recent-header">
            <h3>{orderTexts.recentOrdersTitle}</h3>
            <span>
              {orderTexts.latestOrdersLabel.replace(
                "{count}",
                recentOrders.length
              )}
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <p className="recent-empty">{orderTexts.recentOrdersEmpty}</p>
          ) : (
            <table className="recent-table">
              <thead>
                <tr>
                  <th>{orderTexts.thId}</th>
                  <th>{orderTexts.thCustomer}</th>
                  <th>{orderTexts.thTotal}</th>
                  <th>{orderTexts.thStatus}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer}</td>
                    <td>€{order.total.toFixed(2)}</td>
                    <td>
                      <span
                        className={`order-status order-status-${String(
                          order.status
                        ).toLowerCase()}`}
                      >
                        {orderStatusMap[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
