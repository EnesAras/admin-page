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

// Basit health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API is up" });
});

// LOGIN endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // email kontrol
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(404).json({ error: "UserNotFound" });
  }

  // şifre kontrol
  if (user.password !== password) {
    return res.status(401).json({ error: "WrongPassword" });
  }

  return res.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
