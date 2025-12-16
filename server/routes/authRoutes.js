// routes/authRoutes.js
const express = require("express");
const { findUserByEmail, safeUser } = require("../data/mockStore");

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

  const fakeToken = `fake-jwt-token-${user.id}`;
  return res.json({
    token: fakeToken,
    user: safeUser(user),
  });
});

module.exports = router;
