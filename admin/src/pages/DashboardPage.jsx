// src/pages/DashboardPage.jsx
import { useState, useEffect, useMemo } from "react";
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

const STATUS_COLORS = {
  Pending: "#fbbf24",
  Shipped: "#22c55e",
  Cancelled: "#f97373",
};

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

function DashboardPage() {
  const { t, language, theme } = useSettings();
  const locale = language || "en";
  const prefersDarkMode =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isLightTheme =
    theme === "light" || (theme === "system" && !prefersDarkMode);
  const axisColor = isLightTheme ? "#6b7280" : "#e5e7eb";
  const gridColor = isLightTheme ? "#e2e8f0" : "#111827";
  const tooltipBackground = isLightTheme ? "#ffffff" : "#020617";
  const tooltipBorder = isLightTheme ? "#e5e7eb" : "#1f2937";
  const tooltipColor = isLightTheme ? "#0f172a" : "#e5e7eb";
  const cardFootAliases = {
    cardFootPendingOrders: "pendingOrders",
    cardFootShippedOrders: "shippedOrders",
    cardFootTotalRevenue: "totalRevenue",
  };
  const getCardFootText = (key) => {
    const alias = cardFootAliases[key];
    if (alias) return t(alias);
    return t(key);
  };

  // USERS: Aynen eskisi gibi localStorage + fallback
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

  // ORDERS: Başlangıçta fallback, sonra backend'ten override ediyoruz
  const [orders, setOrders] = useState(() => {
    const stored = localStorage.getItem("admin_orders");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
    return fallbackOrders;
  });

  const [ordersLoading, setOrdersLoading] = useState(false);

 // ==== BACKEND'TEN ORDERS ÇEK ====
useEffect(() => {
  const controller = new AbortController();

  const fetchOrders = async () => {
    setOrdersLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        signal: controller.signal,
      });

      // Backend yoksa / 404 ise: mevcut (fallback/localStorage) orders'u KORU
 if (!res.ok) {
  console.warn("Orders API not available, keeping fallback/local data");
  return;
}


      const data = await res.json();

      const normalized = (Array.isArray(data) ? data : []).map((o) => ({
  ...o,
  date: o.date || o.createdAt || o.created_at,
  total: Number(o.total ?? o.amount ?? o.price ?? 0),
  status: o.status || "Pending",
}));

setOrders(normalized);
localStorage.setItem("admin_orders", JSON.stringify(normalized));


 } catch (err) {
      if (err?.name !== "AbortError") console.warn("Fetch orders failed:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  fetchOrders();
  return () => controller.abort();
}, []);


  // ==== USER METRICS ====
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

  // ==== ORDER METRICS ====
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const statusCounts = useMemo(() => {
    const normalizeKey = (status) => {
      const raw = String(status ?? "unknown").trim().toLowerCase();
      if (raw === "canceled") return "cancelled";
      return raw;
    };
    return orders.reduce((acc, order) => {
      const key = normalizeKey(order?.status);
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [orders]);

  const formatStatusLabel = (key) => {
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
  };

  const priorityOrder = ["pending", "shipped", "delivered", "cancelled"];
  const orderedStatusKeys = [
    ...priorityOrder.filter((key) => statusCounts[key]),
    ...Object.keys(statusCounts)
      .filter((key) => !priorityOrder.includes(key))
      .sort(),
  ];

  const statusChartData = orderedStatusKeys
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

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  // ==== LINE CHART: MONTHLY REVENUE ====
  const monthlyRevenueMap = new Map();

  orders.forEach((order) => {
    if (!order.date) return;
    const d = new Date(order.date);
    if (isNaN(d)) return;

    const month = d.getMonth();
    const year = d.getFullYear();
    const sortKey = year * 100 + month;
    const label = d.toLocaleString(locale, { month: "short" });
    const key = `${year}-${month}`;

    const existing = monthlyRevenueMap.get(key) || {
      label,
      sortKey,
      revenue: 0,
    };

    existing.revenue += order.total || 0;
    monthlyRevenueMap.set(key, existing);
  });

  const now = new Date();
  for (let offset = 5; offset >= 0; offset -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleString(locale, { month: "short" });
    const sortKey = d.getFullYear() * 100 + d.getMonth();

    const entry = monthlyRevenueMap.get(key) || { label, sortKey, revenue: 0 };
    entry.label = label;
    entry.sortKey = sortKey;
    monthlyRevenueMap.set(key, entry);
  }

  const revenueData = Array.from(monthlyRevenueMap.values()).sort(
    (a, b) => a.sortKey - b.sortKey
  );

  // ==== PIE CHART: STATUS DISTRIBUTION ====
  const hasStatusData = statusChartData.length > 0;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">{t("dashboardTitle")}</h2>
      <p className="dashboard-subtitle">{t("dashboardSubtitle")}</p>

      {/* ORDERS FETCH DURUMU */}
      {ordersLoading && (
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
                      <td>{order.customer}</td>
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
    </div>
  );
}

export default DashboardPage;
