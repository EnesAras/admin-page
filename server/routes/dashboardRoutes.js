const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");

const router = express.Router();

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

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const toOrderClient = (order) => {
  if (!order) return null;
  if (typeof order.toClient === "function") {
    return order.toClient();
  }
  const { __v, _id, ...rest } = order;
  return {
    ...rest,
    id: _id ? String(_id) : rest.id,
  };
};

const buildMonthlyRevenue = (orders = [], months = 6) => {
  const now = new Date();
  const buckets = new Map();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    buckets.set(key, {
      label: MONTH_LABELS[date.getMonth()],
      value: 0,
    });
  }

  orders.forEach((order) => {
    const parsed = new Date(order.createdAt || order.date);
    if (Number.isNaN(parsed)) return;
    const key = `${parsed.getFullYear()}-${parsed.getMonth()}`;
    const bucket = buckets.get(key);
    if (!bucket) return;
    const amount =
      typeof order.total === "number" && Number.isFinite(order.total)
        ? order.total
        : 0;
    bucket.value += amount;
  });

  return Array.from(buckets.values()).map((bucket) => ({
    month: bucket.label,
    value: bucket.value,
  }));
};

const mapRecentOrder = (order) => {
  const payload = toOrderClient(order);
  if (!payload) return null;
  return {
    id: payload.id,
    customer: payload.customer || "",
    total:
      typeof payload.total === "number" && Number.isFinite(payload.total)
        ? payload.total
        : 0,
    status: payload.status || "",
    date: isoOrEpoch(order.createdAt || payload.createdAt || payload.date),
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
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      owners,
      recentUsersFromDb,
      totalOrders,
      pendingOrders,
      shippedOrders,
      cancelledOrders,
      recentOrdersFromDb,
      revenueOrders,
      rolesDistinct,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: { $regex: /^ACTIVE$/i } }),
      User.countDocuments({ status: { $regex: /^INACTIVE$/i } }),
      User.countDocuments({ role: { $regex: /^Admin$/i } }),
      User.countDocuments({ role: { $regex: /^Owner$/i } }),
      User.find().sort({ createdAt: -1 }).limit(5),
      Order.countDocuments({}),
      Order.countDocuments({ status: { $regex: /^PENDING$/i } }),
      Order.countDocuments({ status: { $regex: /^SHIPPED$/i } }),
      Order.countDocuments({ status: { $regex: /^CANCELLED$/i } }),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Order.find({
        paymentStatus: { $regex: /^PAID$/i },
        status: { $not: { $regex: /^CANCELLED$/i } },
      }).lean(),
      User.distinct("role"),
    ]);

    const revenueTotal = revenueOrders.reduce(
      (sum, order) =>
        sum +
        (typeof order?.total === "number" && Number.isFinite(order.total)
          ? order.total
          : 0),
      0
    );
    const monthlyRevenue = buildMonthlyRevenue(revenueOrders);

    const payload = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        admins: adminUsers,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        shipped: shippedOrders,
        cancelled: cancelledOrders,
      },
      revenue: {
        total: revenueTotal,
        monthly: monthlyRevenue,
      },
      recentOrders: recentOrdersFromDb
        .map(mapRecentOrder)
        .filter(Boolean),
      recentUsers: recentUsersFromDb.map(mapUser),
    };

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
