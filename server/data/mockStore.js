// server/data/mockStore.js
const rawProducts = require("./products");

const initialUsers = [
  {
    id: 1,
    email: "admin@example.com",
    password: "123456",
    name: "Admin User",
    role: "admin",
    status: "Active",
  },
  {
    id: 2,
    email: "enes@example.com",
    password: "enes123",
    name: "Enes Aras",
    role: "owner",
    status: "Active",
  },
];

const initialOrders = [
  {
    id: 101,
    customer: "Alex Turner",
    email: "alex.turner@example.com",
    date: "2025-12-01",
    total: 125.5,
    status: "Pending",
    method: "Credit Card",
  },
  {
    id: 102,
    customer: "Maria Lopez",
    email: "maria.lopez@example.com",
    date: "2025-12-03",
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

const users = [...initialUsers];
let orders = [...initialOrders];
const products = [...rawProducts];

const safeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

const listUsers = () => users.map(safeUser);
const findUserByEmail = (email) => {
  if (!email) return null;
  const normalized = String(email).trim().toLowerCase();
  return users.find((u) => String(u.email).trim().toLowerCase() === normalized);
};

const addUser = (payload) => {
  const newUser = {
    id: Date.now(),
    name: payload.name,
    email: payload.email,
    role: payload.role || "user",
    status: payload.status || "Active",
    password: payload.password || "",
  };
  users.push(newUser);
  return safeUser(newUser);
};

const updateUser = (id, patch) => {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...patch, id: users[idx].id };
  return safeUser(users[idx]);
};

const deleteUser = (id) => {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  return true;
};

const listOrders = () => orders;
const addOrder = (payload) => {
  const newOrder = {
    id: Date.now(),
    ...payload,
  };
  orders = [newOrder, ...orders];
  return newOrder;
};

const updateOrder = (id, payload) => {
  const idx = orders.findIndex((o) => Number(o.id) === Number(id));
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], ...payload, id: orders[idx].id };
  return orders[idx];
};

const deleteOrder = (id) => {
  const initialLength = orders.length;
  orders = orders.filter((o) => Number(o.id) !== Number(id));
  return orders.length !== initialLength;
};

const listProducts = () => products;
const addProduct = (payload) => {
  const newProduct = {
    id: String(Date.now()),
    name: payload.name || "Untitled Product",
    category: payload.category || "General",
    fandom: payload.fandom || "General",
    price: Number.isFinite(Number(payload.price)) ? Number(payload.price) : 0,
    stock: Number.isFinite(Number(payload.stock)) ? Number(payload.stock) : 0,
    status: payload.status || "Active",
  };
  products.unshift(newProduct);
  return newProduct;
};

const updateProduct = (id, patch) => {
  const idx = products.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) return null;
  products[idx] = {
    ...products[idx],
    ...patch,
    id: products[idx].id,
  };
  return products[idx];
};

const deleteProduct = (id) => {
  const idx = products.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) return false;
  products.splice(idx, 1);
  return true;
};

const buildStatusCounts = (ordersList) => {
  const normalized = ordersList.map((order) => {
    const status = String(order.status ?? "Pending").trim();
    const raw = status.toLowerCase() === "canceled" ? "cancelled" : status.toLowerCase();
    return raw;
  });
  const counts = normalized.reduce((acc, key) => {
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
  const now = new Date();
  const buckets = new Map();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    buckets.set(key, { year: d.getFullYear(), month: d.getMonth(), revenue: 0 });
  }

  ordersList.forEach((order) => {
    const date = new Date(order.date);
    if (Number.isNaN(date)) return;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = buckets.get(key);
    if (!bucket) return;
    bucket.revenue += Number(order.total) || 0;
  });

  return Array.from(buckets.values());
};

const getDashboardStats = () => {
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (Number(o.total) || 0),
    0
  );
  const normalizedOrders = orders.map((order) => ({
    ...order,
    date: order.date || order.createdAt || order.created_at,
    total: Number(order.total ?? order.amount ?? order.price ?? 0),
    status: order.status || "Pending",
  }));

  const statusCounts = buildStatusCounts(normalizedOrders);
  const monthlyRevenue = buildMonthlyRevenue(normalizedOrders);
  const recentOrders = [...normalizedOrders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  const recentUsers = [...users]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5)
    .map(safeUser);

  const activeUsers = users.filter((u) => u.status === "Active").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return {
    totalRevenue,
    totalOrders: normalizedOrders.length,
    totalUsers: users.length,
    activeUsers,
    inactiveUsers: users.length - activeUsers,
    adminCount,
    productsCount: products.length,
    statusCounts,
    monthlyRevenue,
    recentOrders,
    recentUsers,
    pendingOrders: statusCounts.pending,
    shippedOrders: statusCounts.shipped,
  };
};

module.exports = {
  listUsers,
  findUserByEmail,
  addUser,
  updateUser,
  deleteUser,
  listOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  listProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getDashboardStats,
  safeUser,
};
