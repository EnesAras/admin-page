// server/index.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Fake kullanıcılar (şimdilik hafızada)
const users = [
  {
    id: 1,
    email: "admin@example.com",
    password: "123456",
    name: "Admin User",
    role: "admin",
  },
  {
    id: 2,
    email: "enes@example.com",
    password: "enes123",
    name: "Enes Aras",
    role: "owner",
  },
];

// ✅ products artık memory'de değişebilsin diye let
let products = require("./data/products");

// ===== PRODUCTS CRUD =====

// GET all
app.get("/api/products", (req, res) => {
  res.json(products);
});

// POST create
app.post("/api/products", (req, res) => {
  const body = req.body || {};

  const name = String(body.name ?? "").trim();
  if (!name) return res.status(400).json({ error: "NameRequired" });

  const price = Number(body.price ?? 0);
  if (!Number.isFinite(price) || price < 0) return res.status(400).json({ error: "PriceInvalid" });

  const stock = Number(body.stock ?? 0);
  if (!Number.isInteger(stock) || stock < 0) return res.status(400).json({ error: "StockInvalid" });

  const category = String(body.category ?? "Other").trim() || "Other";
  const fandom = String(body.fandom ?? "General").trim() || "General";
  const status = String(body.status ?? "Active");

  const nextId = products.length ? Math.max(...products.map((p) => Number(p?.id ?? 0))) + 1 : 1;

  const newProduct = { id: nextId, name, category, fandom, price, stock, status };

  products = [newProduct, ...products];
  return res.status(201).json(newProduct);
});

// PUT update
app.put("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "BadId" });

  const idx = products.findIndex((p) => Number(p?.id) === id);
  if (idx === -1) return res.status(404).json({ error: "NotFound" });

  const body = req.body || {};

  const name = String(body.name ?? "").trim();
  if (!name) return res.status(400).json({ error: "NameRequired" });

  const price = Number(body.price ?? 0);
  if (!Number.isFinite(price) || price < 0) return res.status(400).json({ error: "PriceInvalid" });

  const stock = Number(body.stock ?? 0);
  if (!Number.isInteger(stock) || stock < 0) return res.status(400).json({ error: "StockInvalid" });

  const category = String(body.category ?? "Other").trim() || "Other";
  const fandom = String(body.fandom ?? "General").trim() || "General";
  const status = String(body.status ?? "Active");

  const updated = { ...products[idx], name, category, fandom, price, stock, status };
  products = products.map((p) => (Number(p?.id) === id ? updated : p));

  return res.json(updated);
});

// DELETE
app.delete("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "BadId" });

  const exists = products.some((p) => Number(p?.id) === id);
  if (!exists) return res.status(404).json({ error: "NotFound" });

  products = products.filter((p) => Number(p?.id) !== id);
  return res.json({ ok: true });
});

// Basit health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API is up" });
});

// LOGIN endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(404).json({ error: "UserNotFound" });

  if (user.password !== password) return res.status(401).json({ error: "WrongPassword" });

  return res.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
