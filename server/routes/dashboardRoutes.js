const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");

const router = express.Router();

const isoOrEpoch = (value) => {
  if (!value) return new Date(0).toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
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

const buildMonthlyRevenue = (orders = [], months = 6) => {
  const now = new Date();
  const buckets = new Map();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    buckets.set(`${date.getFullYear()}-${date.getMonth()}`, {
      label: MONTH_LABELS[date.getMonth()],
      value: 0,
    });
  }

  orders.forEach((order) => {
    const parsed = new Date(order.createdAt || order.date);
    if (Number.isNaN(parsed.getTime())) return;
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

const mapOrderForRecent = (order) => {
  if (!order) return null;
  return {
    id: order._id ? String(order._id) : order.id,
    customer: order.customer || "",
    total:
      typeof order.total === "number" && Number.isFinite(order.total)
        ? order.total
        : 0,
    status: order.status || "",
    date: isoOrEpoch(order.createdAt || order.date),
  };
};

const mapUserForRecent = (user) => {
  if (!user) return null;
  const payload = typeof user.toClient === "function" ? user.toClient() : user;
  const { _id, __v, password, ...rest } = payload;
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
      recentUsers,
      totalOrders,
      pendingOrders,
      shippedOrders,
      cancelledOrders,
      recentOrders,
      revenueOrders,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: { $regex: /^ACTIVE$/i } }),
      User.countDocuments({ status: { $regex: /^INACTIVE$/i } }),
      User.countDocuments({ role: { $regex: /^ADMIN$/i } }),
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

    res.json({
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
      recentUsers: recentUsers.map(mapUserForRecent).filter(Boolean),
      recentOrders: recentOrders
        .map(mapOrderForRecent)
        .filter(Boolean),
    });
  } catch (err) {
    console.error("dashboard.error", err.stack || err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
