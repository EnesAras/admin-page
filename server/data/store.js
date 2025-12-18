const fs = require("fs").promises;
const path = require("path");
const { query } = require("../db");
const rawProducts = require("./products");

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

const safeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

const ensureSchema = async () => {
  const schemaPath = path.join(__dirname, "../db/schema.sql");
  const schemaSql = await fs.readFile(schemaPath, "utf8");
  await query(schemaSql);
};

const seedUsers = async () => {
  if (!(await shouldSeedTable("users"))) return;
  for (const user of DEFAULT_USERS) {
    await query(
      `
      INSERT INTO users (name, email, password, role, status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `,
      [user.name, user.email, user.password, user.role, user.status]
    );
  }
  await query(
    "SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users))"
  );
};

const seedProducts = async () => {
  if (!(await shouldSeedTable("products"))) return;
  for (const product of rawProducts) {
    await query(
      `
      INSERT INTO products (id, name, category, fandom, price, stock, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
    `,
      [
        product.id,
        product.name,
        product.category,
        product.fandom,
        product.price,
        product.stock,
        product.status,
      ]
    );
  }
  await query(
    "SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 0) FROM products))"
  );
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

const ensureSeedData = async () => {
  await seedUsers();
  await seedProducts();
  await seedOrders();
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

const listUsers = async () => {
  const { rows } = await query(
    "SELECT id, name, email, role, status FROM users ORDER BY id"
  );
  return rows;
};

const findUserByEmail = async (email) => {
  if (!email) return null;
  const { rows } = await query(
    "SELECT * FROM users WHERE email = $1 LIMIT 1",
    [email.trim().toLowerCase()]
  );
  return rows[0] || null;
};

const addUser = async (payload) => {
  if (!payload?.email || !payload?.name) return null;
  const { rows } = await query(
    `
    INSERT INTO users (name, email, password, role, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, email, role, status
  `,
    [
      payload.name,
      payload.email.trim().toLowerCase(),
      payload.password || "",
      payload.role || "user",
      payload.status || "Active",
    ]
  );
  return rows[0] || null;
};

const updateUser = async (id, patch) => {
  const { rows } = await query(
    `
    UPDATE users
    SET name = COALESCE($1, name),
        email = COALESCE($2, email),
        role = COALESCE($3, role),
        status = COALESCE($4, status)
    WHERE id = $5
    RETURNING id, name, email, role, status
  `,
    [
      patch.name,
      patch.email ? patch.email.trim().toLowerCase() : null,
      patch.role,
      patch.status,
      Number(id),
    ]
  );
  return rows[0] || null;
};

const deleteUser = async (id) => {
  const { rowCount } = await query("DELETE FROM users WHERE id = $1", [
    Number(id),
  ]);
  return rowCount > 0;
};

const listProducts = async () => {
  const { rows } = await query("SELECT * FROM products ORDER BY id");
  return rows;
};

const addProduct = async (payload) => {
  const { rows } = await query(
    `
    INSERT INTO products (name, category, fandom, price, stock, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,
    [
      payload.name || "Untitled Product",
      payload.category || "General",
      payload.fandom || "General",
      Number(payload.price) || 0,
      Number(payload.stock) || 0,
      payload.status || "Active",
    ]
  );
  return rows[0] || null;
};

const updateProduct = async (id, patch) => {
  const priceValue = Number.isFinite(Number(patch.price))
    ? Number(patch.price)
    : null;
  const stockValue = Number.isFinite(Number(patch.stock))
    ? Number(patch.stock)
    : null;

  const { rows } = await query(
    `
    UPDATE products
    SET name = COALESCE($1, name),
        category = COALESCE($2, category),
        fandom = COALESCE($3, fandom),
        price = COALESCE($4, price),
        stock = COALESCE($5, stock),
        status = COALESCE($6, status)
    WHERE id = $7
    RETURNING *
  `,
    [
      patch.name,
      patch.category,
      patch.fandom,
      priceValue,
      stockValue,
      patch.status,
      Number(id),
    ]
  );
  return rows[0] || null;
};

const deleteProduct = async (id) => {
  const { rowCount } = await query("DELETE FROM products WHERE id = $1", [
    Number(id),
  ]);
  return rowCount > 0;
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
  const [ordersRes, usersRes, productsRes] = await Promise.all([
    query("SELECT * FROM orders"),
    query("SELECT * FROM users"),
    query("SELECT * FROM products"),
  ]);

  const orders = ordersRes.rows.map((order) => ({
    ...order,
    items: order.items || [],
  }));
  const users = usersRes.rows.map((user) => safeUser(user));
  const products = productsRes.rows;

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
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);
  const activeUsers = users.filter((u) => u.status === "Active").length;

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalUsers: users.length,
    activeUsers,
    inactiveUsers: users.length - activeUsers,
    adminCount: users.filter((u) => u.role === "admin").length,
    productsCount: products.length,
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
};

module.exports = {
  initStore,
  safeUser,
  listUsers,
  findUserByEmail,
  addUser,
  updateUser,
  deleteUser,
  listProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  listOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  getDashboardStats,
};
