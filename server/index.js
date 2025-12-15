// server/index.js (CommonJS)
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const productsRoutes = require("./routes/productsRoutes");
const authRoutes = require("./routes/authRoutes");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);



// ===== FAKE USERS (in-memory) =====
const users = [
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

// ===== ORDERS (in-memory) =====
let orders = [
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

// ===== HEALTH =====
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API running" });
});

// ===== AUTH (single source of truth) =====
app.post("/api/auth/login", (req, res) => {
  console.log("LOGIN HIT:", req.body);
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "").trim();

  const user = users.find((u) => String(u.email).toLowerCase() === email);

  if (!user) return res.status(404).json({ error: "UserNotFound" });
  if (user.password !== password)
    return res.status(401).json({ error: "WrongPassword" });

  // password göndermiyoruz
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    },
  });
});

// ===== USERS CRUD =====
app.get("/api/users", (req, res) => {
  const safe = users.map(({ password, ...rest }) => rest);
  res.json(safe);
});

app.post("/api/users", (req, res) => {
  const { name, email, role = "user", status = "Active" } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: "NameEmailRequired" });
  }

  const exists = users.some(
    (u) => String(u.email).toLowerCase() === String(email).toLowerCase()
  );
  if (exists) return res.status(409).json({ error: "EmailExists" });

  const newUser = {
    id: Date.now(),
    name,
    email,
    role,
    status,
    password: "", // şimdilik boş
  };

  users.push(newUser);
  const { password: _, ...safe } = newUser;
  res.status(201).json(safe);
});

app.put("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return res.status(404).json({ error: "UserNotFound" });

  const { email } = req.body || {};
  if (email) {
    const taken = users.some(
      (u) =>
        u.id !== id &&
        String(u.email).toLowerCase() === String(email).toLowerCase()
    );
    if (taken) return res.status(409).json({ error: "EmailExists" });
  }

  users[idx] = { ...users[idx], ...req.body };
  const { password, ...safe } = users[idx];
  res.json(safe);
});

app.delete("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return res.status(404).json({ error: "UserNotFound" });

  users.splice(idx, 1);
  res.json({ ok: true });
});

// ===== ORDERS CRUD =====
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const newOrder = { id: Date.now(), ...req.body };
  orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

app.put("/api/orders/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = orders.findIndex((o) => Number(o.id) === id);
  if (idx === -1) return res.status(404).json({ error: "OrderNotFound" });

  orders[idx] = { ...orders[idx], ...req.body, id: orders[idx].id };
  res.json(orders[idx]);
});

app.delete("/api/orders/:id", (req, res) => {
  const id = Number(req.params.id);
  orders = orders.filter((o) => Number(o.id) !== id);
  res.json({ ok: true });
});

// ===== DASHBOARD =====
app.get("/api/dashboard", (req, res) => {
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (Number(o.total) || 0),
    0
  );

  res.json({
    usersCount: users.length,
    ordersCount: orders.length,
    productsCount: products.length,
    totalRevenue,
    recentOrders: orders.slice(0, 5),
  });
});
console.log("REACHED LISTEN");

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
setInterval(() => {}, 1000);
