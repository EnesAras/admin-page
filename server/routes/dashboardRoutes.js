const express = require("express");
const { mockStore } = require("../data/mockStore");
const User = require("../models/User");

const router = express.Router();

const normalizeStatus = (value) => {
  const normalized =
    typeof value === "string" ? value.trim().toLowerCase() : "";
  if (normalized === "canceled") return "cancelled";
  return normalized || "pending";
};

const isoOrEpoch = (value) => {
  if (!value) {
    return new Date(0).toISOString();
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date(0).toISOString();
  }
  return date.toISOString();
};

const isRevenueOrder = (status) => {
  return ["shipped", "delivered"].includes(status);
};

const buildOrderCounts = (list) => {
  return list.reduce(
    (acc, order) => {
      const status = normalizeStatus(order.status);
      acc.total += 1;
      if (status === "pending") acc.pending += 1;
      else if (status === "shipped") acc.shipped += 1;
      else if (status === "cancelled") acc.cancelled += 1;
      else acc.delivered += 1;
      return acc;
    },
    { total: 0, pending: 0, shipped: 0, cancelled: 0, delivered: 0 }
  );
};

const buildMonthlyRevenue = (list, months = 6) => {
  const now = new Date();
  const buckets = new Map();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    buckets.set(key, {
      month: date.getMonth(),
      year: date.getFullYear(),
      revenue: 0,
    });
  }

  list.forEach((order) => {
    const status = normalizeStatus(order.status);
    if (!isRevenueOrder(status)) return;
    const parsed = new Date(order.date);
    if (Number.isNaN(parsed)) return;
    const key = `${parsed.getFullYear()}-${parsed.getMonth()}`;
    const bucket = buckets.get(key);
    if (!bucket) return;
    const amount =
      typeof order.total === "number" && Number.isFinite(order.total)
        ? order.total
        : 0;
    bucket.revenue += amount;
  });

  return Array.from(buckets.values());
};

const buildRecentOrders = (list, limit = 5) => {
  const cloned = [...list];
  const sorted = cloned.sort((a, b) => {
    const dateA = Date.parse(isoOrEpoch(a.date));
    const dateB = Date.parse(isoOrEpoch(b.date));
    if (dateB !== dateA) return dateB - dateA;
    return (b.id || 0) - (a.id || 0);
  });
  return sorted.slice(0, limit).map((order) => ({
    id: order.id,
    customer: order.customer || "",
    total:
      typeof order.total === "number" && Number.isFinite(order.total)
        ? order.total
        : 0,
    status: order.status || "",
    date: isoOrEpoch(order.date),
  }));
};

const buildDashboardPayload = (ordersList = []) => {
  const storeOrders = Array.isArray(ordersList) ? ordersList : [];
  const {
    total: orderTotal,
    pending,
    shipped,
    cancelled,
  } = buildOrderCounts(storeOrders);

  const monthlyRevenue = buildMonthlyRevenue(storeOrders);
  const revenueTotal = monthlyRevenue.reduce(
    (sum, bucket) => sum + bucket.revenue,
    0
  );

  const recentOrders = buildRecentOrders(storeOrders);

  return {
    orders: {
      total: orderTotal,
      pending,
      shipped,
      cancelled,
    },
    revenue: {
      total: revenueTotal,
      monthly: monthlyRevenue,
    },
    recentOrders,
  };
};

const mapUser = (user) => {
  if (!user) return null;
  if (typeof user.toClient === "function") {
    return user.toClient();
  }
  const { __v, _id, password, ...rest } = user;
  return {
    ...rest,
    id: _id ? String(_id) : rest.id,
  };
};

router.get("/", async (req, res) => {
  try {
    const storeOrders = Array.isArray(mockStore.orders)
      ? mockStore.orders
      : [];
    const payload = buildDashboardPayload(storeOrders);
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      owners,
      recentUsersFromDb,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: { $regex: /^ACTIVE$/i } }),
      User.countDocuments({ status: { $regex: /^INACTIVE$/i } }),
      User.countDocuments({ role: { $regex: /^Admin$/i } }),
      User.countDocuments({ role: { $regex: /^Owner$/i } }),
      User.find().sort({ createdAt: -1 }).limit(5),
    ]);
    const rolesDistinct = await User.distinct("role");

    payload.users = {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      admins: adminUsers,
    };
    payload.recentUsers = recentUsersFromDb.map(mapUser);
    console.log(
      "[dashboard users] total/active/inactive/admins/owners =",
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      owners
    );
    console.log("[dashboard users] roles distinct:", rolesDistinct);

    res.json(payload);
  } catch (err) {
    console.error("dashboard.error", err.stack || err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
