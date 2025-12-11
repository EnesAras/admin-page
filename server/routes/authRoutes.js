// routes/authRoutes.js
const express = require("express");
const router = express.Router();

// Şimdilik fake kullanıcılar (ileride DB'ye taşırız)
const users = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123", // SADECE development için, production'da asla plain text olmaz :)
    role: "admin",
  },
  {
    id: 2,
    name: "Normal User",
    email: "user@example.com",
    password: "user123",
    role: "user",
  },
];

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Eksik data kontrolü
  if (!email || !password) {
    return res.status(400).json({ message: "Email ve şifre zorunludur." });
  }

  // Kullanıcıyı bul
  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    // Bilerek generic mesaj: hangi kısmın yanlış olduğunu söylemiyoruz
    return res.status(401).json({ message: "Geçersiz email veya şifre." });
  }

  // Şimdilik sahte token
  const fakeToken = `fake-jwt-token-${user.id}`;

  return res.json({
    token: fakeToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

module.exports = router;
