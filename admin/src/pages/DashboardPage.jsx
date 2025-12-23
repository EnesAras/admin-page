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
import { apiFetch, emitApiToast } from "../lib/api";
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

const normalizeTotal = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]+/g, "");
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const formatMoney = (value) => normalizeTotal(value).toFixed(2);

const normalizeOrder = (order) => ({
  ...order,
  date: order.date || order.createdAt || order.created_at || "",
  total: normalizeTotal(order.total ?? order.amount ?? order.price ?? 0),
  status: order.status || "Pending",
});

const computeUserStats = (usersList = []) => {
  const entries = Array.isArray(usersList) ? usersList : [];
  const totalUsers = entries.length;
  const activeUsers = entries.filter(
    (user) => String(user?.status ?? "").toLowerCase() === "active"
  ).length;
  const adminCount = entries.filter((user) =>
    ["admin", "owner"].includes(String(user?.role ?? "").toLowerCase())
  ).length;
  return {
    totalUsers,
    activeUsers,
    inactiveUsers: Math.max(0, totalUsers - activeUsers),
    adminCount,
  };
};

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
    bucket.revenue += normalizeTotal(order.total);
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
      (sum, o) => sum + normalizeTotal(o.total),
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

const CARD_FOOT_FALLBACKS = {
  cardFootPendingOrders: "ordersLabel",
  cardFootShippedOrders: "ordersLabel",
  cardFootTotalRevenue: "totalRevenue",
};

const formatPresenceTimestamp = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
};

const formatPresenceTooltipTime = (value) => {
  const formatted = formatPresenceTimestamp(value);
  return formatted && formatted !== "-" ? formatted : null;
};

const buildPresenceTooltip = (presence, t) => {
  if (!presence) return "";
  const statusLabel = presence?.online
    ? t("presence.online", "Online")
    : t("presence.offline", "Offline");
  const parts = [statusLabel];

  if (presence?.online) {
    const loggedIn = formatPresenceTooltipTime(presence.lastLoginAt);
    if (loggedIn) {
      parts.push(
        t("presence.loggedInAt", "Logged in at {time}").replace(
          "{time}",
          loggedIn
        )
      );
    }
    const lastSeen =
      formatPresenceTooltipTime(presence.lastSeenAt || presence.lastLoginAt);
    if (lastSeen) {
      parts.push(
        t("presence.lastSeen", "Last seen {time}").replace(
          "{time}",
          lastSeen
        )
      );
    }
  } else {
    const lastLogout = formatPresenceTooltipTime(presence.lastLogoutAt);
    if (lastLogout) {
      parts.push(
        t("presence.lastLogout", "Last logout: {time}").replace(
          "{time}",
          lastLogout
        )
      );
    }
  }
  return parts.join(" • ");
};

const DASHBOARD_CACHE_TTL = 45 * 1000;
let dashboardCache = null;
let dashboardCacheTimestamp = 0;
let dashboardFetchPromise = null;

const fetchDashboardSnapshot = async () => {
  const now = Date.now();
  if (dashboardCache && now - dashboardCacheTimestamp < DASHBOARD_CACHE_TTL) {
    return dashboardCache;
  }
  if (!dashboardFetchPromise) {
    const timerLabel = "dashboard-fetch";
    const shouldProfile =
      process.env.NODE_ENV !== "production" &&
      typeof console !== "undefined" &&
      typeof console.time === "function" &&
      typeof console.timeEnd === "function";

    dashboardFetchPromise = (async () => {
      if (shouldProfile) console.time(timerLabel);
      try {
        const data = await apiFetch("/api/dashboard");
        dashboardCache = data;
        dashboardCacheTimestamp = Date.now();
        return data;
      } finally {
        if (shouldProfile) console.timeEnd(timerLabel);
        dashboardFetchPromise = null;
      }
    })();
  }
  return dashboardFetchPromise;
};

function DashboardPage() {
  const { t, language, colorMode } = useSettings();
  const { currentUser, hasRole } = useAuth();
  const { lastNotification, notificationHistory } = useToast();
  const canViewPresence = hasRole(["admin", "owner"]);
  const [presenceMap, setPresenceMap] = useState(new Map());
  const loadPresenceData = useCallback(async () => {
    if (!canViewPresence) {
      setPresenceMap(new Map());
      return;
    }

    try {
      const response = await apiFetch("/api/presence/users");
      const map = new Map();
      (response?.users || []).forEach((user) => {
        const userId = Number(user?.id);
        if (Number.isFinite(userId)) {
          map.set(userId, user.presence || null);
        }
      });
      setPresenceMap(map);
    } catch (err) {
      console.error("Presence fetch failed:", err);
    }
  }, [canViewPresence]);

  useEffect(() => {
    loadPresenceData();
  }, [loadPresenceData]);
  const locale = language || "en";
  const isLightTheme = colorMode === "light";
  const axisColor = isLightTheme ? "#6b7280" : "#e5e7eb";
  const gridColor = isLightTheme ? "#e2e8f0" : "#111827";
  const tooltipBackground = isLightTheme ? "#ffffff" : "#020617";
  const tooltipBorder = isLightTheme ? "#e5e7eb" : "#1f2937";
  const tooltipColor = isLightTheme ? "#0f172a" : "#e5e7eb";
  const getCardFootText = (key) => {
    const text = t(key);
    if (text !== key) return text;
    const fallbackKey = CARD_FOOT_FALLBACKS[key];
    if (fallbackKey) return t(fallbackKey, key);
    return key;
  };

  const fallbackDashboard = useMemo(
    () => buildDashboardState(fallbackOrders, fallbackUsers),
    []
  );

  const initialHealthMessage = t(
    "apiHealthIdle",
    "No API notifications yet."
  );
  const [apiHealth, setApiHealth] = useState({
    status: "idle",
    message: initialHealthMessage,
    updatedAt: Date.now(),
  });
  const updateApiHealth = (status, message) => {
    setApiHealth({
      status,
      message,
      updatedAt: Date.now(),
    });
  };

  const [userStats, setUserStats] = useState(() =>
    computeUserStats(fallbackUsers)
  );

  const capabilityLabelMap = useMemo(
    () => ({
      manageUsers: t("capabilityManageUsers", "Manage users"),
      manageProducts: t("capabilityManageProducts", "Manage products"),
      manageOrders: t("capabilityManageOrders", "Manage orders"),
      accessSettings: t("capabilityAccessSettings", "Access settings"),
      fullAccess: t("capabilityFullAccess", "Full system access"),
    }),
    [t]
  );
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

  const [dashboardData, setDashboardData] = useState(fallbackDashboard);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [auditEvents, setAuditEvents] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setDashboardLoading(true);
      const successMessage = t(
        "api.toast.dashboardRefreshed",
        "Dashboard data refreshed"
      );
      const failureMessage = t(
        "api.health.error",
        "API encountered an issue"
      );
      try {
        const data = await fetchDashboardSnapshot();
        if (!mounted || !data) return;
        setDashboardData((prev) => ({
          ...prev,
          ...data,
          statusCounts: { ...prev.statusCounts, ...(data.statusCounts || {}) },
          monthlyRevenue: data.monthlyRevenue || prev.monthlyRevenue,
          recentOrders: data.recentOrders || prev.recentOrders,
          recentUsers: data.recentUsers || prev.recentUsers,
        }));
        emitApiToast({
          message: successMessage,
          type: "success",
          dedupeKey: "dashboard-sync",
        });
        updateApiHealth(
          "healthy",
          t("api.health.operational", "All systems operational")
        );
      } catch (err) {
        const errMessage = err?.message || failureMessage;
        emitApiToast({ message: errMessage, type: "error" });
        updateApiHealth("error", errMessage);
        console.warn("Failed to load dashboard data:", err);
      } finally {
        if (mounted) {
          setDashboardLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [language, t]);

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      const successMessage = t("api.toast.userSynced", "User data synced");
      const failureMessage = t(
        "api.health.error",
        "API encountered an issue"
      );
      try {
        const users = await apiFetch("/api/users");
        if (!mounted) return;
        setUserStats(computeUserStats(users));
        emitApiToast({
          message: successMessage,
          type: "success",
          dedupeKey: "users-sync",
        });
        updateApiHealth(
          "healthy",
          t("api.health.operational", "All systems operational")
        );
      } catch (err) {
        if (!mounted) return;
        const errMessage = err?.message || failureMessage;
        emitApiToast({
          message: errMessage,
          type: "error",
        });
        updateApiHealth("error", errMessage);
      }
    };

    loadUsers();

    return () => {
      mounted = false;
    };
  }, [language, t]);

  useEffect(() => {
    let mounted = true;

    const loadAudit = async () => {
      setAuditLoading(true);
      setAuditError("");
      try {
        const payload = await apiFetch("/api/audit?limit=10");
        if (!mounted) return;
        const events = Array.isArray(payload?.events) ? payload.events : [];
        setAuditEvents(events);
      } catch (err) {
        if (!mounted) return;
        setAuditError(
          t("activity.fetchError", "Unable to load activity feed.")
        );
      } finally {
        if (mounted) {
          setAuditLoading(false);
        }
      }
    };

    loadAudit();

    return () => {
      mounted = false;
    };
  }, [language, t]);

  const {
    totalOrders,
    totalRevenue,
    statusCounts: statusCountsData = {},
    monthlyRevenue: monthlyRevenueData = [],
    recentOrders: recentOrdersData = [],
    recentUsers: recentUsersData = [],
  } = dashboardData;
  const { totalUsers, activeUsers, inactiveUsers, adminCount } = userStats;

  const activeRate =
    totalUsers === 0 ? 0 : Math.round((activeUsers / totalUsers) * 100);

  const apiHealthStatusLabel =
    apiHealth.status === "error"
      ? t("api.status.error", "ERROR")
      : t("api.status.success", "SUCCESS");

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

  const resolveActivityActor = (actor) => {
    if (!actor) return t("activity.unknownActor", "Unknown actor");
    return (
      actor.name ||
      actor.email ||
      actor.role ||
      t("activity.unknownActor", "Unknown actor")
    );
  };

  const formatActivityMessage = useCallback(
    (entry) => {
      if (!entry) return "";
      const { action, entityId, meta } = entry;
      switch (action) {
        case "LOGIN_SUCCESS":
          return t("activity.loginSuccess", "Signed in");
        case "LOGIN_FAILED": {
          const reason = meta?.reason ? ` (${meta.reason})` : "";
          return (
            t("activity.loginFailed", "Failed sign-in attempt") + reason
          );
        }
        case "LOGOUT":
          return t("activity.logout", "Signed out");
        case "ORDER_STATUS_CHANGED": {
          const template = t(
            "activity.orderStatusChanged",
            "Order #{orderId} marked {status}"
          );
          const statusLabel =
            meta?.status && meta.status !== ""
              ? formatStatusLabel(meta.status)
              : t("orders.thStatus", "Status");
          const orderId = entityId || meta?.orderId || "?";
          return template
            .replace("{orderId}", String(orderId))
            .replace("{status}", statusLabel);
        }
        default:
          return String(action)
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
      }
    },
    [formatStatusLabel, t]
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
      <div className="dashboard-grid dashboard-summary-grid">
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
        <p
          className={`card-number api-health-status api-health-status-${apiHealth.status}`}
        >
          <span className="api-health-dot" aria-hidden />
          <span className="api-health-label">{apiHealthStatusLabel}</span>
          <span>{apiHealth.message}</span>
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

      <div className="dashboard-card dashboard-activity-card">
        <div className="activity-header">
          <p className="card-label">
            {t("dashboardActivityTitle", "Activity")}
          </p>
          <span className="activity-subtitle">
            {t("dashboardActivitySubtitle", "Recent audit log entries")}
          </span>
        </div>
        <div className="activity-list">
          {auditLoading ? (
            <p className="activity-placeholder">
              {t("activity.loading", "Loading activity...")}
            </p>
          ) : auditError ? (
            <p className="activity-error">{auditError}</p>
          ) : auditEvents.length === 0 ? (
            <p className="activity-placeholder">
              {t("dashboardActivityEmpty", "No activity yet.")}
            </p>
          ) : (
            auditEvents.map((event) => (
              <article
                key={event.id ?? `${event.ts}-${event.action}`}
                className="activity-entry"
              >
                <div className="activity-entry-body">
                  <p>{formatActivityMessage(event)}</p>
                  <span className="activity-entry-actor">
                    {resolveActivityActor(event.actor)}
                  </span>
                </div>
                <div className="activity-entry-meta">
                  <span>{formatTimestamp(event.ts)}</span>
                  {event.meta?.reason && (
                    <small className="activity-reason">
                      {event.meta.reason}
                    </small>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {/* ORDER CARDS */}
      <div className="dashboard-grid dashboard-order-grid">
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
          €{formatMoney(totalRevenue)}
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
            <div className="recent-table-wrapper">
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>{t("thName")}</th>
                  <th>{t("thEmail")}</th>
                  <th>{t("thRole")}</th>
                  <th>{t("thStatus")}</th>
                  {canViewPresence && <th>{t("presence.column", "Presence")}</th>}
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

                  const userPresenceId = Number(user.id);
                  const presence = Number.isFinite(userPresenceId)
                    ? presenceMap.get(userPresenceId)
                    : null;
                  const hasPresenceRecord = presence != null;
                  const presenceLabel = hasPresenceRecord
                    ? presence?.online
                      ? t("presence.online", "Online")
                      : t("presence.offline", "Offline")
                    : t("presence.unknown", "Unknown");
                  const presenceTooltip = hasPresenceRecord
                    ? buildPresenceTooltip(presence, t)
                    : "";

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
                      {canViewPresence && (
                        <td className="recent-presence-cell">
                          <div className="recent-presence">
                            <span
                              className={`recent-presence-indicator ${
                                presence?.online
                                  ? "presence-online"
                                  : hasPresenceRecord
                                  ? "presence-offline"
                                  : "presence-unknown"
                              }`}
                              title={presenceTooltip || undefined}
                            />
                            <span className="recent-presence-label">
                              {presenceLabel}
                            </span>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
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
            <div className="recent-table-wrapper">
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
                      <td>€{formatMoney(order.total)}</td>
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
            </div>
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
