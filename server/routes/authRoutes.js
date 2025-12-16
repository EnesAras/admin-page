// routes/authRoutes.js
const express = require("express");
const { findUserByEmail, safeUser } = require("../data/mockStore");

const ROLE_CAPABILITIES = {
  admin: {
    manageUsers: true,
    manageProducts: true,
    manageOrders: true,
    accessSettings: true,
  },
  owner: {
    manageUsers: true,
    manageProducts: true,
    manageOrders: true,
    accessSettings: true,
    fullAccess: true,
  },
  moderator: {
    manageUsers: false,
    manageProducts: false,
    manageOrders: true,
    accessSettings: false,
  },
};

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = findUserByEmail(String(email).toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  if (String(user.status).toLowerCase() !== "active") {
    return res.status(403).json({ error: "AccountInactive" });
  }

  const fakeToken = `fake-jwt-token-${user.id}-${Date.now()}`;
  const role = String(user.role || "user").toLowerCase();
  const capabilities =
    ROLE_CAPABILITIES[role] || ROLE_CAPABILITIES["moderator"] || {};

  return res.json({
    token: fakeToken,
    user: safeUser(user),
    capabilities,
  });
});

module.exports = router;
