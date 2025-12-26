// src/pages/DashboardPage.jsx
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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

const CARD_FOOT_FALLBACKS = {
  cardFootPendingOrders: "ordersLabel",
  cardFootShippedOrders: "ordersLabel",
  cardFootTotalRevenue: "totalRevenue",
};

const INITIAL_DASHBOARD_DATA = {
  users: { total: 0, active: 0, inactive: 0, admins: 0 },
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  adminCount: 0,
  totalOrders: 0,
  totalRevenue: 0,
  pendingOrders: 0,
  shippedOrders: 0,
  statusCounts: {
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  },
  monthlyRevenue: [],
  recentOrders: [],
  recentUsers: [],
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
  if (!presence) {
    return t("presence.tooltipUnknown", "{status} • {noSessionYet}")
      .replace("{status}", t("presence.unknown", "Unknown"))
      .replace(
        "{noSessionYet}",
        t("presence.noSessionYet", "No session recorded yet")
      );
  }
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

const DashboardCardState = ({
  variant,
  title,
  message,
  actionLabel,
  onAction,
}) => (
  <div className={`dashboard-card-state dashboard-card-state-${variant}`}>
    {variant === "loading" && (
      <span className="dashboard-card-state-spinner" aria-hidden="true" />
    )}
    {title && <p className="dashboard-card-state-title">{title}</p>}
    {message && (
      <p className="dashboard-card-state-message">{message}</p>
    )}
    {onAction && (
      <button
        type="button"
        className="dashboard-card-state-action"
        onClick={onAction}
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const DASHBOARD_CACHE_TTL = 45 * 1000;
let dashboardCache = null;
let dashboardCacheTimestamp = 0;
let dashboardFetchPromise = null;

const normalizeDashboardPayload = (payload) => {
  if (!payload) return null;
  const userBucket = payload.users || {};
  const orderBucket = payload.orders || {};
  const revenueBucket = payload.revenue || {};
  const totalOrders = Number.isFinite(Number(orderBucket.total))
    ? Number(orderBucket.total)
    : 0;
  const pendingOrders = Number.isFinite(Number(orderBucket.pending))
    ? Number(orderBucket.pending)
    : 0;
  const shippedOrders = Number.isFinite(Number(orderBucket.shipped))
    ? Number(orderBucket.shipped)
    : 0;
  const cancelledOrders = Number.isFinite(Number(orderBucket.cancelled))
    ? Number(orderBucket.cancelled)
    : 0;
  const deliveredOrders = Math.max(
    0,
    totalOrders - pendingOrders - shippedOrders - cancelledOrders
  );
  const normalizedUsers = {
    total: Number.isFinite(Number(userBucket.total))
      ? Number(userBucket.total)
      : 0,
    active: Number.isFinite(Number(userBucket.active))
      ? Number(userBucket.active)
      : 0,
    inactive: Number.isFinite(Number(userBucket.inactive))
      ? Number(userBucket.inactive)
      : 0,
    admins: Number.isFinite(Number(userBucket.admins))
      ? Number(userBucket.admins)
      : 0,
  };

  return {
    users: normalizedUsers,
    totalUsers: normalizedUsers.total,
    activeUsers: normalizedUsers.active,
    inactiveUsers: normalizedUsers.inactive,
    adminCount: normalizedUsers.admins,
    totalOrders,
    pendingOrders,
    shippedOrders,
    totalRevenue: normalizeTotal(revenueBucket.total ?? 0),
    statusCounts: {
      pending: pendingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    },
    monthlyRevenue: Array.isArray(revenueBucket.monthly)
      ? revenueBucket.monthly
      : [],
    recentOrders: Array.isArray(payload.recentOrders)
      ? payload.recentOrders
      : [],
    recentUsers: Array.isArray(payload.recentUsers)
      ? payload.recentUsers
      : [],
  };
};

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
        console.log("[dashboard api payload]", data);
        console.log("[dashboard api users]", data?.users);
        const normalized = normalizeDashboardPayload(data);
        if (!normalized) {
          throw new Error("InvalidDashboardPayload");
        }
        dashboardCache = normalized;
        dashboardCacheTimestamp = Date.now();
        return normalized;
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

  const initialHealthMessage = t(
    "apiHealthIdle",
    "No API notifications yet."
  );
  const [apiHealth, setApiHealth] = useState({
    status: "idle",
    message: initialHealthMessage,
    updatedAt: Date.now(),
  });
  const updateApiHealth = useCallback((status, message) => {
    setApiHealth({
      status,
      message,
      updatedAt: Date.now(),
    });
  }, []);

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

  const [dashboardData, setDashboardData] = useState(INITIAL_DASHBOARD_DATA);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [auditEvents, setAuditEvents] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState("");

  const dashboardMountedRef = useRef(true);
  const loadDashboardData = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError("");
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
      if (!dashboardMountedRef.current || !data) return;
      setDashboardData(data);
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
      if (!dashboardMountedRef.current) return;
      const errMessage = err?.message || failureMessage;
      setDashboardError(errMessage);
      emitApiToast({ message: errMessage, type: "error" });
      updateApiHealth("error", errMessage);
      console.error(
        "Failed to load dashboard data:",
        err,
        "status:",
        err?.status,
        "data:",
        err?.data ?? err?.message
      );
    } finally {
      if (dashboardMountedRef.current) {
        setDashboardLoading(false);
      }
    }
  }, [t, updateApiHealth]);

  useEffect(() => {
    dashboardMountedRef.current = true;
    loadDashboardData();
    return () => {
      dashboardMountedRef.current = false;
    };
  }, [loadDashboardData]);

  const handleRetryDashboard = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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
    users: dashboardUsers = {},
  } = dashboardData;
  const totalUsers = Number.isFinite(Number(dashboardUsers.total))
    ? Number(dashboardUsers.total)
    : 0;
  const activeUsers = Number.isFinite(Number(dashboardUsers.active))
    ? Number(dashboardUsers.active)
    : 0;
  const inactiveUsers = Number.isFinite(Number(dashboardUsers.inactive))
    ? Number(dashboardUsers.inactive)
    : 0;
  const adminCount = Number.isFinite(Number(dashboardUsers.admins))
    ? Number(dashboardUsers.admins)
    : 0;

  const activeRate =
    totalUsers === 0 ? 0 : Math.round((activeUsers / totalUsers) * 100);
  const isDashboardReady = !dashboardLoading && !dashboardError;
  const metricTooltip = t("dashboard.dataUnavailableTooltip", "Data unavailable");
  const formatMetricValue = (value, formatter) => {
    const ready = isDashboardReady && value !== undefined && value !== null;
    const display = ready
      ? formatter
        ? formatter(value)
        : value
      : "—";
    return {
      display,
      ready,
    };
  };
  const totalUsersMetric = formatMetricValue(totalUsers);
  const activeUsersMetric = formatMetricValue(activeUsers);
  const inactiveUsersMetric = formatMetricValue(inactiveUsers);
  const adminCountMetric = formatMetricValue(adminCount);
  const totalOrdersMetric = formatMetricValue(totalOrders);
  const totalRevenueMetric = formatMetricValue(totalRevenue, (value) =>
    `€${formatMoney(value)}`
  );
  const activeRateDisplay = isDashboardReady ? `${activeRate}%` : "—";

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
      label: entry.month || "-",
      revenue:
        typeof entry.value === "number" && Number.isFinite(entry.value)
          ? entry.value
          : 0,
    }));
  }, [monthlyRevenueData]);

  // ==== PIE CHART: STATUS DISTRIBUTION ====
  const hasStatusData = statusChartData.length > 0;

  return (
    <div className="dashboard-container">
      <div className="page-header dashboard-header">
        <div className="page-header-main">
          <span className="page-header-icon" aria-hidden="true">
            📊
          </span>
          <div>
            <p className="page-header-title">{t("dashboardTitle")}</p>
            <span className="page-header-caption">
              {t("dashboardSubtitle")}
            </span>
          </div>
        </div>
      </div>
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
          {t(
            "dashboard.loading",
            "Loading latest orders from server..."
          )}
        </div>
      )}


      {/* USER CARDS */}
      <div className="dashboard-grid dashboard-summary-grid">
        <div className="dashboard-card">
          <p className="card-label">{t("cardTotalUsers")}</p>
          <p
            className="card-number"
            title={
              totalUsersMetric.ready ? undefined : metricTooltip
            }
          >
            {totalUsersMetric.display}
          </p>
          <p className="card-foot">
            {t("cardFootActiveRate")}{" "}
            <span title={!isDashboardReady ? metricTooltip : undefined}>
              {activeRateDisplay}
            </span>
          </p>
        </div>

        <div className="dashboard-card">
          <p className="card-label">{t("cardActiveUsers")}</p>
          <p
            className="card-number text-green"
            title={activeUsersMetric.ready ? undefined : metricTooltip}
          >
            {activeUsersMetric.display}
          </p>
          <p className="card-foot subtle">{t("cardFootActiveUsers")}</p>
        </div>

        <div className="dashboard-card">
          <p className="card-label">{t("cardInactiveUsers")}</p>
          <p
            className="card-number text-amber"
            title={inactiveUsersMetric.ready ? undefined : metricTooltip}
          >
            {inactiveUsersMetric.display}
          </p>
          <p className="card-foot subtle">{t("cardFootInactiveUsers")}</p>
        </div>

        <div className="dashboard-card">
          <p className="card-label">{t("cardAdmins")}</p>
          <p
            className="card-number text-sky"
            title={adminCountMetric.ready ? undefined : metricTooltip}
          >
            {adminCountMetric.display}
          </p>
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
        <p
          className="card-number"
          title={totalOrdersMetric.ready ? undefined : metricTooltip}
        >
          {totalOrdersMetric.display}
        </p>
      </div>

      {orderedStatusKeys.map((key) => {
        const count = statusCounts[key] || 0;
        if (count === 0) return null;
        const countMetric = formatMetricValue(count);
        return (
          <div className="dashboard-card" key={key}>
            <p className="card-label">{formatStatusLabel(key)}</p>
            <p
              className={`card-number ${statusTextClass(key)}`}
              title={countMetric.ready ? undefined : metricTooltip}
            >
              {countMetric.display}
            </p>
            <p className="card-foot subtle">
              {t("ordersLabel")}
            </p>
          </div>
        );
      })}

        <div className="dashboard-card">
          <p className="card-label">{t("totalRevenue")}</p>
          <p
            className="card-number text-green"
            title={totalRevenueMetric.ready ? undefined : metricTooltip}
          >
            {totalRevenueMetric.display}
          </p>
          <p className="card-foot subtle">
            {getCardFootText("cardFootTotalRevenue")}
          </p>
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
          {dashboardLoading ? (
            <DashboardCardState
              variant="loading"
              title={t("dashboard.loading", "Loading…")}
              message={t(
                "dashboard.loadingBodyRevenue",
                "Fetching revenue data…"
              )}
            />
          ) : dashboardError ? (
            <DashboardCardState
              variant="error"
              title={t(
                "dashboard.errorTitle",
                "Unable to load revenue data"
              )}
              message={dashboardError}
              actionLabel={t("dashboard.retry", "Retry")}
              onAction={handleRetryDashboard}
            />
          ) : revenueData.length === 0 ? (
            <DashboardCardState
              variant="empty"
              title={t("dashboard.emptyTitle", "No revenue yet")}
              message={t(
                "dashboard.emptyBody",
                "No revenue data is available at the moment."
              )}
            />
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
          {dashboardLoading ? (
            <DashboardCardState
              variant="loading"
              title={t("dashboard.loading", "Loading…")}
              message={t(
                "dashboard.loadingBodyStatus",
                "Gathering status breakdown…"
              )}
            />
          ) : dashboardError ? (
            <DashboardCardState
              variant="error"
              title={t(
                "dashboard.errorTitle",
                "Unable to load status data"
              )}
              message={dashboardError}
              actionLabel={t("dashboard.retry", "Retry")}
              onAction={handleRetryDashboard}
            />
          ) : !hasStatusData ? (
            <DashboardCardState
              variant="empty"
              title={t("dashboard.emptyTitle", "No status data")}
              message={t(
                "dashboard.emptyBodyStatus",
                "No order status events are available yet."
              )}
            />
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
                    <tr key={user.id || user.email}>
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
