import express from "express";
import cors from "cors";
import usersData from "./data/users.js";
import ordersData from "./data/orders.js";
import productsData from "./data/products.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let users = [...usersData];
let orders = [...ordersData];
let products = [...productsData];

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users", (req, res) => {
  const { name, email, role, status } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "name and email required" });
  }
  const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const newUser = {
    id: nextId,
    name,
    email,
    role: role || "User",
    status: status || "Active"
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "user not found" });
  }
  const { name, email, role, status } = req.body;
  const updated = {
    ...users[index],
    name: name ?? users[index].name,
    email: email ?? users[index].email,
    role: role ?? users[index].role,
    status: status ?? users[index].status
  };
  users[index] = updated;
  res.json(updated);
});

app.delete("/api/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const exists = users.some(u => u.id === id);
  if (!exists) {
    return res.status(404).json({ message: "user not found" });
  }
  users = users.filter(u => u.id !== id);
  res.status(204).end();
});

app.get("/api/orders", (req, res) => {
  res.json(orders);
});

app.patch("/api/orders/:id/status", (req, res) => {
  const id = Number(req.params.id);
  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ message: "order not found" });
  }
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "status required" });
  }
  order.status = status;
  res.json(order);
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const { name, category, fandom, price, stock, status } = req.body;
  if (!name) {
    return res.status(400).json({ message: "name required" });
  }
  const nextId =
    products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const newProduct = {
    id: nextId,
    name,
    category: category || "Other",
    fandom: fandom || "General",
    price: Number(price) || 0,
    stock: Number.isFinite(stock) ? stock : Number(stock) || 0,
    status: status || "Active"
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "product not found" });
  }
  const { name, category, fandom, price, stock, status } = req.body;
  const updated = {
    ...products[index],
    name: name ?? products[index].name,
    category: category ?? products[index].category,
    fandom: fandom ?? products[index].fandom,
    price: price !== undefined ? Number(price) : products[index].price,
    stock:
      stock !== undefined ? Number(stock) : products[index].stock,
    status: status ?? products[index].status
  };
  products[index] = updated;
  res.json(updated);
});

app.delete("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const exists = products.some(p => p.id === id);
  if (!exists) {
    return res.status(404).json({ message: "product not found" });
  }
  products = products.filter(p => p.id !== id);
  res.status(204).end();
});

app.get("/api/stats", (req, res) => {
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "Active").length;
  const inactiveUsers = totalUsers - activeUsers;
  const adminCount = users.filter(u => u.role === "Admin").length;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const shippedOrders = orders.filter(o => o.status === "Shipped").length;
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.status === "Cancelled" ? 0 : o.total),
    0
  );

  res.json({
    totalUsers,
    activeUsers,
    inactiveUsers,
    adminCount,
    totalOrders,
    pendingOrders,
    shippedOrders,
    totalRevenue
  });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
