const fs = require("fs").promises;
const path = require("path");
const bcrypt = require("bcryptjs");
const { query } = require("../db");
const Product = require("../db/Product");
const User = require("../db/User");

const HASH_ROUNDS = 10;

const normalizePassword = (value = "") => {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value);
};

const hashPassword = async (password = "") =>
  bcrypt.hash(normalizePassword(password), HASH_ROUNDS);

const presenceByUserId = new Map();
const createPresenceEntry = (userId, initial = {}) => ({
  userId,
  online: false,
  lastLoginAt: null,
  lastLogoutAt: null,
  sessionStartedAt: null,
  sessionEndedAt: null,
  lastSessionDurationSeconds: null,
  lastSeenAt: null,
  ...initial,
});

const markUserLogin = (userId) => {
  if (!userId) return null;
  const now = new Date().toISOString();
  const existing = presenceByUserId.get(userId) || createPresenceEntry(userId);
  const updated = {
    ...existing,
    online: true,
    lastLoginAt: now,
    sessionStartedAt: now,
    sessionEndedAt: null,
    lastSeenAt: now,
  };
  presenceByUserId.set(userId, updated);
  return updated;
};

const markUserLogout = (userId) => {
  if (!userId) return null;
  const now = new Date().toISOString();
  const existing = presenceByUserId.get(userId) || createPresenceEntry(userId);
  const sessionStart = existing.sessionStartedAt
    ? new Date(existing.sessionStartedAt).getTime()
    : null;
  const duration =
    sessionStart != null
      ? Math.max(0, Math.floor((Date.now() - sessionStart) / 1000))
      : null;
  const updated = {
    ...existing,
    online: false,
    lastLogoutAt: now,
    sessionEndedAt: now,
    lastSessionDurationSeconds: duration,
    lastSeenAt: now,
  };
  presenceByUserId.set(userId, updated);
  return updated;
};

const getPresenceRecords = () => {
  return Array.from(presenceByUserId.values()).map((record) => ({
    ...record,
  }));
};

const DEFAULT_USERS = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "123456",
    role: "admin",
    status: "Active",
  },
  {
    name: "Enes Aras",
    email: "enes@example.com",
    password: "enes123",
    role: "owner",
    status: "Active",
  },
  {
    name: "Mira Gomez",
    email: "mira@example.com",
    password: "moderator123",
    role: "moderator",
    status: "Active",
  },
];

const shouldSeedTable = async (tableName) => {
  if (process.env.SEED_ON_BOOT === "true") return true;
  const { rows } = await query(`SELECT COUNT(*) FROM ${tableName}`);
  return Number(rows[0].count) === 0;
};

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const PAYMENT_METHODS = [
  "Credit Card",
  "PayPal",
  "Apple Pay",
  "Bank Transfer",
  "Klarna",
];
const ORDER_ITEMS = [
  "Premium Figure Bundle",
  "Collector Manga Set",
  "Gaming Poster Pack",
  "Anime Accessory Haul",
  "Limited Edition Hoodie",
  "LED Desk Lamp",
];

const DEFAULT_PRODUCT_SEED = [
  {
    name: "Nebula Voyager Figure",
    category: "Figure",
    price: 59.99,
    stock: 12,
    status: "active",
    image:
      "https://images.example.com/products/nebula-voyager-figure.jpg",
  },
  {
    name: "Polaris Tactical Backpack",
    category: "Gear",
    price: 134.5,
    stock: 5,
    status: "active",
    image: "https://images.example.com/products/polaris-backpack.jpg",
  },
  {
    name: "Cityscape Gaming Desk Mat",
    category: "Accessories",
    price: 29.95,
    stock: 24,
    status: "active",
    image: "https://images.example.com/products/cityscape-desk-mat.jpg",
  },
  {
    name: "Solar Flare LED Shelf",
    category: "Lighting",
    price: 74.0,
    stock: 3,
    status: "active",
    image: "https://images.example.com/products/solar-flare-shelf.jpg",
  },
  {
    name: "Echo Pulse Headset Stand",
    category: "Accessories",
    price: 17.5,
    stock: 15,
    status: "active",
    image: "https://images.example.com/products/echo-pulse-stand.jpg",
  },
  {
    name: "Midnight Pulse Hoodie",
    category: "Apparel",
    price: 64.99,
    stock: 8,
    status: "inactive",
    image: "https://images.example.com/products/midnight-hoodie.jpg",
  },
  {
    name: "Eclipse Collector Poster",
    category: "Poster",
    price: 21.0,
    stock: 0,
    status: "active",
    image: "https://images.example.com/products/eclipse-poster.jpg",
  },
  {
    name: "Quartermaster Journals Set",
    category: "Stationery",
    price: 39.99,
    stock: 18,
    status: "active",
    image: "https://images.example.com/products/journals-set.jpg",
  },
  {
    name: "Riftwalker Action Figure",
    category: "Figure",
    price: 48.75,
    stock: 4,
    status: "active",
    image: "https://images.example.com/products/riftwalker-figure.jpg",
  },
  {
    name: "Aurora Soundwave Speakers",
    category: "Audio",
    price: 129.99,
    stock: 6,
    status: "active",
    image: "https://images.example.com/products/soundwave-speakers.jpg",
  },
];

const PRODUCT_STATUS_VALUES = ["active", "inactive"];
const sanitizeProductStatus = (value) => {
  const normalized =
    typeof value === "string" ? value.trim().toLowerCase() : "";
  if (PRODUCT_STATUS_VALUES.includes(normalized)) {
    return normalized;
  }
  return "active";
};

const randomFrom = (arr, idx) => arr[idx % arr.length];
const randomTotal = (base, variance = 0.2) => {
  const delta = base * variance;
  return Number((base + (Math.random() * 2 - 1) * delta).toFixed(2));
};

const createPastOrder = (seed) => {
  const now = new Date();
  const daysBack = Math.floor(seed * 3.7) + 1;
  const orderDate = new Date(now);
  orderDate.setDate(now.getDate() - daysBack);

  return {
    id: 200 + seed,
    customer: randomFrom(
      [
        "Alex Turner",
        "Maria Lopez",
        "David Kim",
        "Nadia Patel",
        "Samuel Rivera",
        "Elena Chen",
        "Diego Alvarez",
        "Sasha Ivanova",
        "Mateo Rossi",
        "Chloe Baker",
      ],
      seed
    ),
    email: `${randomFrom(["alex", "maria", "david", "nadia", "samuel", "elena"], seed)}@example.com`,
    date: orderDate.toISOString().split("T")[0],
    total: randomTotal(50 + (seed % 6) * 25),
    status: randomFrom(ORDER_STATUSES, seed + 2),
    method: randomFrom(PAYMENT_METHODS, seed + 1),
    items: Array.from({ length: 2 }, (_, idx) => ({
      name: `${randomFrom(ORDER_ITEMS, seed + idx * 3)}`,
      price: randomTotal(15 + idx * 7),
      quantity: idx + 1,
    })),
    shippingAddress: `${seed % 999} Harbor Ave, Suite ${seed + 11}`,
  };
};

const toPlainObject = (entity) => {
  if (!entity) return null;
  if (typeof entity.toObject === "function") {
    return entity.toObject();
  }
  return { ...entity };
};

const safeUser = (user) => {
  if (!user) return null;
  const entity = toPlainObject(user);
  if (!entity) return null;
  const { password, __v, _id, ...rest } = entity;
  const id = _id ? String(_id) : rest.id ? String(rest.id) : undefined;
  return { ...rest, id };
};

const safeProduct = (product) => {
  if (!product) return null;
  const entity = toPlainObject(product);
  if (!entity) return null;
  const { __v, _id, ...rest } = entity;
  return { ...rest, id: _id ? String(_id) : undefined };
};

const ensureSchema = async () => {
  const schemaPath = path.join(__dirname, "../db/schema.sql");
  const schemaSql = await fs.readFile(schemaPath, "utf8");
  await query(schemaSql);
};

const seedOrders = async () => {
  if (!(await shouldSeedTable("orders"))) return;
  for (let index = 0; index < 30; index += 1) {
    const order = createPastOrder(index);
    await query(
      `
      INSERT INTO orders (id, customer, email, date, total, status, method, shipping_address, items)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO NOTHING
    `,
      [
        order.id,
        order.customer,
        order.email,
        order.date,
        order.total,
        order.status,
        order.method,
        order.shippingAddress,
        JSON.stringify(order.items),
      ]
    );
  }
  await query(
    "SELECT setval('orders_id_seq', (SELECT COALESCE(MAX(id), 0) FROM orders))"
  );
};

const seedMongoUsers = async () => {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) return;

  for (const user of DEFAULT_USERS) {
    const hashedPassword = await hashPassword(user.password);
    try {
      await User.create({
        name: user.name,
        email: String(user.email).trim().toLowerCase(),
        password: hashedPassword,
        role: user.role,
        status: user.status,
      });
    } catch (err) {
      if (err.code === 11000) {
        continue;
      }
      throw err;
    }
  }
};

const seedMongoProducts = async () => {
  const existing = await Product.countDocuments();
  if (existing > 0) return;

  const normalized = DEFAULT_PRODUCT_SEED.map((product) => ({
    name: String(product.name || "").trim(),
    price: Number.isFinite(Number(product.price)) ? Number(product.price) : 0,
    stock: Number.isFinite(Number(product.stock)) ? Number(product.stock) : 0,
    category: String(product.category || "General").trim(),
    status: sanitizeProductStatus(product.status),
    image: String(product.image || "").trim(),
  }));

  const validEntries = normalized.filter((entry) => entry.name.length > 0);
  if (validEntries.length === 0) return;

  await Product.insertMany(validEntries);
};

const ensureSeedData = async () => {
  await seedOrders();
  await seedMongoUsers();
  await seedMongoProducts();
};

const logProductCount = async () => {
  const count = await Product.countDocuments();
  console.log(`[db] products count: ${count}`);
};

const normalizeStatus = (status) => {
  if (!status) return "pending";
  const raw = String(status).trim().toLowerCase();
  if (raw === "canceled") return "cancelled";
  if (raw === "delivered") return "delivered";
  return raw;
};

const buildStatusCounts = (orders) => {
  const counts = orders.reduce((acc, order) => {
    const key = normalizeStatus(order.status);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return {
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    processing: 0,
    ...counts,
  };
};

const buildMonthlyRevenue = (orders, months = 6) => {
  const map = new Map();
  const now = new Date();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map.set(key, { year: d.getFullYear(), month: d.getMonth(), revenue: 0 });
  }

  orders.forEach((order) => {
    const date = new Date(order.date);
    if (Number.isNaN(date)) return;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = map.get(key);
    if (!bucket) return;
    bucket.revenue += Number(order.total) || 0;
  });

  return Array.from(map.values());
};

const listOrders = async () => {
  const { rows } = await query(
    "SELECT * FROM orders ORDER BY date DESC, id DESC"
  );
  return rows.map((order) => ({
    ...order,
    items: order.items || [],
  }));
};

const addOrder = async (payload) => {
  const items = payload.items ? JSON.stringify(payload.items) : "[]";
  const { rows } = await query(
    `
    INSERT INTO orders (customer, email, date, total, status, method, shipping_address, items)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `,
    [
      payload.customer || "Unknown Customer",
      payload.email || "customer@example.com",
      payload.date || new Date().toISOString().split("T")[0],
      Number(payload.total) || 0,
      payload.status || "Pending",
      payload.method,
      payload.shippingAddress || payload.shipping_address || "",
      items,
    ]
  );
  return rows[0] || null;
};

const updateOrder = async (id, patch) => {
  const items = patch.items ? JSON.stringify(patch.items) : null;
  const totalValue = Number.isFinite(Number(patch.total))
    ? Number(patch.total)
    : null;
  const { rows } = await query(
    `
    UPDATE orders
    SET customer = COALESCE($1, customer),
        email = COALESCE($2, email),
        date = COALESCE($3, date),
        total = COALESCE($4, total),
        status = COALESCE($5, status),
        method = COALESCE($6, method),
        shipping_address = COALESCE($7, shipping_address),
        items = COALESCE($8, items)
    WHERE id = $9
    RETURNING *
  `,
    [
      patch.customer,
      patch.email,
      patch.date,
      totalValue,
      patch.status,
      patch.method,
      patch.shippingAddress || patch.shipping_address,
      items,
      Number(id),
    ]
  );
  return rows[0] || null;
};

const deleteOrder = async (id) => {
  const { rowCount } = await query("DELETE FROM orders WHERE id = $1", [
    Number(id),
  ]);
  return rowCount > 0;
};

const getDashboardStats = async () => {
  const [ordersRes, mongoUsers, mongoProducts] = await Promise.all([
    query("SELECT * FROM orders"),
    User.find().lean(),
    Product.find().lean(),
  ]);

  const orders = ordersRes.rows.map((order) => ({
    ...order,
    items: order.items || [],
  }));
  const users = mongoUsers.map((user) => safeUser(user));
  const products = mongoProducts;

  const totalRevenue = orders.reduce(
    (sum, o) => sum + (Number(o.total) || 0),
    0
  );
  const statusCounts = buildStatusCounts(orders);
  const monthlyRevenue = buildMonthlyRevenue(orders);
  const recentOrders = orders
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  const recentUsers = users
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    })
    .slice(0, 5);
  const activeUsers = users.filter((u) => u.status === "Active").length;

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalUsers: users.length,
    activeUsers,
    inactiveUsers: users.length - activeUsers,
    adminCount: users.filter((u) => u.role === "admin").length,
    productsCount: Array.isArray(products) ? products.length : 0,
    statusCounts,
    monthlyRevenue,
    recentOrders,
    recentUsers,
    pendingOrders: statusCounts.pending,
    shippedOrders: statusCounts.shipped,
  };
};

const initStore = async () => {
  await ensureSchema();
  await ensureSeedData();
  await logProductCount();
};

module.exports = {
  initStore,
  safeUser,
  safeProduct,
  listOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  getDashboardStats,
  getPresenceRecords,
  markUserLogin,
  markUserLogout,
  hashPassword,
};
