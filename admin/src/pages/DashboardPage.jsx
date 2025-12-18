// src/pages/DashboardPage.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
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
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

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
const DASHBOARD_PRIORITY_ORDER = ["pending", "shipped", "delivered", "cancelled"];
const ROLE_PRIORITY = {
  Owner: 1,
  Admin: 2,
  Moderator: 3,
  User: 4,
};

const normalizeOrder = (order) => ({
  ...order,
  date: order.date || order.createdAt || order.created_at || "",
  total: Number(order.total ?? order.amount ?? order.price ?? 0),
  status: order.status || "Pending",
});

const buildStatusCounts = (ordersList) => {
  const counts = ordersList.reduce((acc, order) => {
    const raw = String(order?.status ?? "pending")
      .trim()
      .toLowerCase();
    const key = raw === "canceled" ? "cancelled" : raw;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    ...counts,
  };
};

const buildMonthlyRevenue = (ordersList, months = 6) => {
  const map = new Map();
  const now = new Date();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map.set(key, { year: d.getFullYear(), month: d.getMonth(), revenue: 0 });
  }

  ordersList.forEach((order) => {
    const date = new Date(order.date);
    if (Number.isNaN(date)) return;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = map.get(key);
    if (!bucket) return;
    bucket.revenue += Number(order.total) || 0;
  });

  return Array.from(map.values());
};

const buildDashboardState = (ordersList, usersList) => {
  const normalizedOrders = ordersList.map(normalizeOrder);
  const statusCounts = buildStatusCounts(normalizedOrders);
  const monthlyRevenue = buildMonthlyRevenue(normalizedOrders);
  const recentOrders = [...normalizedOrders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const sanitizedUsers = [...usersList].map((user) => ({ ...user }));
  const recentUsers = sanitizedUsers
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const activeUsers = usersList.filter((u) => u.status === "Active").length;
  const adminCount = usersList.filter((u) => u.role === "Admin").length;

  return {
    totalUsers: usersList.length,
    activeUsers,
    inactiveUsers: usersList.length - activeUsers,
    adminCount,
    totalOrders: normalizedOrders.length,
    totalRevenue: normalizedOrders.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0
    ),
    statusCounts,
    monthlyRevenue,
    recentOrders,
    recentUsers,
    pendingOrders: statusCounts.pending,
    shippedOrders: statusCounts.shipped,
    productsCount: 0,
  };
};

function DashboardPage() {
  const { t, language, colorMode } = useSettings();
  const { currentUser } = useAuth();
  const { lastNotification, notificationHistory, addToast } = useToast();
  const locale = language || "en";
  const isLightTheme = colorMode === "light";
  const axisColor = isLightTheme ? "#6b7280" : "#e5e7eb";
  const gridColor = isLightTheme ? "#e2e8f0" : "#111827";
  const tooltipBackground = isLightTheme ? "#ffffff" : "#020617";
  const tooltipBorder = isLightTheme ? "#e5e7eb" : "#1f2937";
  const tooltipColor = isLightTheme ? "#0f172a" : "#e5e7eb";
  const cardFootFallbacks = {
    cardFootPendingOrders: "ordersLabel",
    cardFootShippedOrders: "ordersLabel",
    cardFootTotalRevenue: "totalRevenue",
  };
  const getCardFootText = (key) => {
    const text = t(key);
    if (text !== key) return text;
    const fallbackKey = cardFootFallbacks[key];
    if (fallbackKey) return t(fallbackKey, key);
    return key;
  };

  const fallbackDashboard = useMemo(
    () => buildDashboardState(fallbackOrders, fallbackUsers),
    []
  );

  const capabilityLabelMap = {
    manageUsers: t("capabilityManageUsers", "Manage users"),
    manageProducts: t("capabilityManageProducts", "Manage products"),
    manageOrders: t("capabilityManageOrders", "Manage orders"),
    accessSettings: t("capabilityAccessSettings", "Access settings"),
    fullAccess: t("capabilityFullAccess", "Full system access"),
  };
  const roleKey = currentUser?.role
    ? `role${currentUser.role.charAt(0).toUpperCase()}${currentUser.role
        .slice(1)
        .toLowerCase()}`
    : "roleUser";
  const roleLabel = t(roleKey, currentUser?.role || "User");

  const capabilityEntries = useMemo(() => {
    const caps = currentUser?.capabilities || {};
    return Object.keys(caps)
      .filter((key) => caps[key])
      .map((key) => capabilityLabelMap[key] || key);
  }, [currentUser, capabilityLabelMap]);

  const formatTimestamp = (value) => {
    if (!value) return "-";
    return new Intl.DateTimeFormat(language || "en", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  };

  const getActivityLabel = (count) => {
    const template = t(
      "apiHealthEvents",
      "{count} recent notifications"
    );
    return template.replace("{count}", String(count));
  };

  const [dashboardData, setDashboardData] = useState(fallbackDashboard);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    setDashboardLoading(true);
    apiFetch("/api/dashboard")
      .then((data) => {
        if (!mounted) return;
        setDashboardData((prev) => ({
          ...prev,
          ...data,
          statusCounts: { ...prev.statusCounts, ...(data.statusCounts || {}) },
          monthlyRevenue: data.monthlyRevenue || prev.monthlyRevenue,
          recentOrders: data.recentOrders || prev.recentOrders,
          recentUsers: data.recentUsers || prev.recentUsers,
        }));
      })
      .catch((err) => {
        console.warn("Failed to load dashboard data:", err);
      })
      .finally(() => {
        if (mounted) setDashboardLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const {
    totalUsers,
    activeUsers,
    inactiveUsers,
    adminCount,
    totalOrders,
    totalRevenue,
    statusCounts: statusCountsData = {},
    monthlyRevenue: monthlyRevenueData = [],
    recentOrders: recentOrdersData = [],
    recentUsers: recentUsersData = [],
  } = dashboardData;

  const activeRate =
    totalUsers === 0 ? 0 : Math.round((activeUsers / totalUsers) * 100);

  const formatStatusLabel = useCallback(
    (key) => {
      const mapping = {
        pending: t("orderStatusPending"),
        shipped: t("orderStatusShipped"),
        cancelled: t("orderStatusCancelled"),
        delivered: t("orderStatusDelivered") || "Delivered",
      };
      if (mapping[key]) return mapping[key];
      return key
        .split(/[\s_-]+/)
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join(" ");
    },
    [t]
  );

  const statusCounts = useMemo(
    () => ({
      pending: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      ...statusCountsData,
    }),
    [statusCountsData]
  );

  const orderedStatusKeys = useMemo(() => {
    return [
      ...DASHBOARD_PRIORITY_ORDER.filter((key) => statusCounts[key]),
      ...Object.keys(statusCounts)
        .filter((key) => !DASHBOARD_PRIORITY_ORDER.includes(key))
        .sort(),
    ];
  }, [statusCounts]);

  const statusChartData = useMemo(() => {
    return orderedStatusKeys
      .map((key) => {
        const count = statusCounts[key];
        if (!count) return null;
        return {
          key,
          label: formatStatusLabel(key),
          value: count,
        };
      })
      .filter(Boolean);
  }, [orderedStatusKeys, statusCounts, formatStatusLabel]);

  const statusColorMap = {
    pending: "#fbbf24",
    shipped: "#22c55e",
    delivered: "#22d3ee",
    cancelled: "#f97373",
  };
  const statusTextClass = (key) => {
    if (key === "pending") return "text-amber";
    if (key === "shipped") return "text-green";
    if (key === "cancelled") return "text-rose";
    return "text-slate";
  };

  const recentUsers = useMemo(() => {
    return [...recentUsersData]
      .sort((a, b) => {
        if (ROLE_PRIORITY[a.role] !== ROLE_PRIORITY[b.role]) {
          return ROLE_PRIORITY[a.role] - ROLE_PRIORITY[b.role];
        }
        return b.id - a.id;
      });
  }, [recentUsersData]);

  const recentOrders = useMemo(() => {
    return [...recentOrdersData];
  }, [recentOrdersData]);

  // ==== LINE CHART: MONTHLY REVENUE ====
  const revenueData = useMemo(() => {
    if (!monthlyRevenueData?.length) return [];
    return monthlyRevenueData.map((entry) => ({
      label: new Intl.DateTimeFormat(locale, { month: "short" }).format(
        new Date(entry.year, entry.month, 1)
      ),
      revenue: entry.revenue,
    }));
  }, [monthlyRevenueData, locale]);

  // ==== PIE CHART: STATUS DISTRIBUTION ====
  const hasStatusData = statusChartData.length > 0;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">{t("dashboardTitle")}</h2>
      <p className="dashboard-subtitle">{t("dashboardSubtitle")}</p>
      {lastNotification && (
        <div
          className={`dashboard-api-banner dashboard-api-banner-${
            lastNotification.type || "info"
          }`}
        >
          <div>
            <p className="banner-label">
              {t("apiBannerLabel", "API notification")}
            </p>
            <p className="banner-message">{lastNotification.message}</p>
          </div>
          {notificationHistory?.length > 0 && (
            <div className="banner-events">
              {notificationHistory.slice(0, 3).map((event) => (
                <div key={`${event.timestamp}-${event.message}`} className="banner-event">
                  <span
                    className={`banner-event-type banner-event-${event.type || "info"}`}
                  >
                    {t(
                      `apiEventType${(event.type || "info")
                        .toString()
                        .toUpperCase()}`,
                      event.type || "info"
                    )}
                  </span>
                  <span className="banner-event-time">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ORDERS FETCH DURUMU */}
      {dashboardLoading && (
        <div className="dashboard-loading">
          {t("dashboardLoading") || "Loading latest orders from server..."}
        </div>
      )}


      {/* USER CARDS */}
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

      <div className="dashboard-card dashboard-api-card">
        <p className="card-label">{t("apiHealthTitle", "API health")}</p>
        <p className="card-number">
          {notificationHistory.length > 0
            ? getActivityLabel(notificationHistory.length)
            : t("apiHealthIdle", "No API notifications yet.")}
        </p>
        <ul className="api-event-list">
          {notificationHistory.length === 0 ? (
            <li className="api-event-empty">
              {t("apiHealthIdle", "No API notifications yet.")}
            </li>
          ) : (
            notificationHistory.map((event) => (
              <li key={`${event.timestamp}-${event.message}`}>
                <span
                  className={`api-event-type api-event-${event.type || "info"}`}
                >
                  {t(
                    `apiEventType${(
                      event.type || "info"
                    ).toString().toUpperCase()}`,
                    event.type || "info"
                  )}
                </span>
                <div className="api-event-details">
                  <p className="api-event-message">{event.message}</p>
                  <span className="api-event-time">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="dashboard-card dashboard-toast-log">
        <div className="toast-log-header">
          <p>{t("apiToastLogTitle", "Recent API toasts")}</p>
          <span className="toast-log-subtitle">
            {t("apiToastLogSubtitle", "Tap an entry to replay the message.")}
          </span>
        </div>
        <div className="toast-log-list">
          {notificationHistory.length === 0 && (
            <p className="toast-log-empty">
              {t("apiToastLogEmpty", "No toast history yet.")}
            </p>
          )}
          {notificationHistory.map((event) => (
            <button
              key={`${event.timestamp}-${event.message}`}
              type="button"
              className="toast-log-item"
              onClick={() =>
                addToast({
                  message: event.message,
                  type: event.type,
                  duration: 2200,
                })
              }
            >
              <span
                className={`toast-log-type toast-log-${
                  event.type || "info"
                }`}
              >
                {t(
                  `apiEventType${(event.type || "info")
                    .toString()
                    .toUpperCase()}`,
                  event.type || "info"
                )}
              </span>
              <div>
                <p>{event.message}</p>
                <small>{formatTimestamp(event.timestamp)}</small>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ORDER CARDS */}
      <div className="dashboard-grid">
      <div className="dashboard-card">
        <p className="card-label">{t("totalOrders")}</p>
        <p className="card-number">{totalOrders}</p>
      </div>

      {orderedStatusKeys.map((key) => {
        const count = statusCounts[key] || 0;
        if (count === 0) return null;
        return (
          <div className="dashboard-card" key={key}>
            <p className="card-label">{formatStatusLabel(key)}</p>
            <p className={`card-number ${statusTextClass(key)}`}>{count}</p>
            <p className="card-foot subtle">
              {t("ordersLabel")}
            </p>
          </div>
        );
      })}

      <div className="dashboard-card">
        <p className="card-label">{t("totalRevenue")}</p>
        <p className="card-number text-green">
          €{totalRevenue.toFixed(2)}
        </p>
        <p className="card-foot subtle">{getCardFootText("cardFootTotalRevenue")}</p>
      </div>
      </div>

      {/* REVENUE LINE CHART */}
      <section className="dashboard-chart-card">
        <div className="chart-header">
          <div>
            <h3>{t("revenueOverviewTitle")}</h3>
            <p>{t("revenueOverviewSubtitle")}</p>
          </div>
          <span className="chart-badge">Live demo</span>
        </div>

        <div className="chart-wrapper">
          {revenueData.length === 0 ? (
            <p className="chart-empty">{t("revenueOverviewEmpty")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={revenueData}
                margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="label" stroke={axisColor} tickLine={false} />
                <YAxis stroke={axisColor} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBackground,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: tooltipColor }}
                  itemStyle={{ color: tooltipColor }}
                />
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
            <h3>{t("orderStatusDistributionTitle")}</h3>
            <p>{t("orderStatusDistributionSubtitle")}</p>
          </div>
        </div>

        <div className="chart-wrapper">
          {!hasStatusData ? (
            <p className="chart-empty">
              {t("orderStatusDistributionEmpty")}
            </p>
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
                    fill={statusColorMap[entry.key] || "#6b7280"}
                  />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBackground,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: tooltipColor }}
                  itemStyle={{ color: tooltipColor }}
                  formatter={(value, name) => [
                    `${value} ${t("ordersLabel")}`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* RECENT USERS & ORDERS */}
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
                  const normalizedRole = String(user.role || "")
                    .trim()
                    .toLowerCase();
                  let roleKey = "roleUser";
                  if (normalizedRole === "admin") roleKey = "roleAdmin";
                  else if (normalizedRole === "owner") roleKey = "roleOwner";
                  else if (normalizedRole === "manager") roleKey = "roleManager";
                  else if (normalizedRole === "moderator")
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

        <div className="recent-users">
          <div className="recent-header">
            <h3>{t("recentOrdersTitle")}</h3>
            <span>
              {t("latestOrdersLabel").replace(
                "{count}",
                recentOrders.length
              )}
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <p className="recent-empty">
              {t("recentOrdersEmpty")}
            </p>
          ) : (
            <table className="recent-table">
              <thead>
                <tr>
                  <th>{t("thId")}</th>
                  <th>{t("thCustomer")}</th>
                  <th>{t("orders.thPayment")}</th>
                  <th>{t("orders.thShipping", "Shipping")}</th>
                  <th>{t("thTotal")}</th>
                  <th>{t("thStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const statusKey = `orderStatus${order.status}`;
                  const statusText =
                    t(statusKey) !== statusKey ? t(statusKey) : order.status;

                  return (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        <div>{order.customer}</div>
                        {order.items?.length ? (
                          <div className="order-items">
                            {order.items.map((item) => item.name).join(", ")}
                          </div>
                        ) : null}
                      </td>
                      <td>{order.method || t("orders.detailsPayment", "Payment")}</td>
                      <td className="order-shipping">
                        {order.shippingAddress || "-"}
                      </td>
                      <td>€{order.total.toFixed(2)}</td>
                      <td>
                        <span
                          className={`order-status order-status-${String(
                            order.status
                          ).toLowerCase()}`}
                        >
                          {statusText}
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
      <div className="dashboard-role-panel">
        <div className="role-header">
          <div>
            <p className="role-title">
              {t("rolePanelTitle", "Your role & capabilities")}
            </p>
            <p className="role-subtitle">
              {t(
                "rolePanelSubtitle",
                "Permissions currently granted to your account."
              )}
            </p>
          </div>
          <span className={`role-badge role-${currentUser?.role || "user"}`}>
            {roleLabel}
          </span>
        </div>
        {capabilityEntries.length ? (
          <ul className="role-capabilities">
            {capabilityEntries.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
        ) : (
          <p className="role-empty">
            {t("rolePanelEmpty", "No extra permissions defined.")}
          </p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
