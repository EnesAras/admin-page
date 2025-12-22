// routes/authRoutes.js
const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const { findUserByEmail, safeUser } = require("../data/store");

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

const normalizeString = (value) =>
  value === undefined || value === null ? "" : String(value);

const isBcryptHash = (value) =>
  typeof value === "string" && value.startsWith("$2") && value.length > 20;

const comparePasswords = async (candidate, stored) => {
  const normalizedCandidate = normalizeString(candidate);
  const normalizedStored = normalizeString(stored);

  if (!normalizedCandidate || !normalizedStored) {
    return false;
  }

  if (isBcryptHash(normalizedStored)) {
    return bcrypt.compare(normalizedCandidate, normalizedStored);
  }

  const candidateBuffer = Buffer.from(normalizedCandidate, "utf8");
  const storedBuffer = Buffer.from(normalizedStored, "utf8");
  if (candidateBuffer.length !== storedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(candidateBuffer, storedBuffer);
};

router.post("/login", async (req, res) => {
  const payload = typeof req.body === "object" && req.body ? req.body : {};
  const emailInput =
    typeof payload.email === "string" ? payload.email.trim() : "";
  const email = emailInput.toLowerCase();
  const password = normalizeString(payload.password);

  if (!email || !password) {
    return res.status(400).json({ error: "MissingEmailOrPassword" });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "InvalidCredentials" });
    }

    const passwordMatches = await comparePasswords(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: "InvalidCredentials" });
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
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: err.message || "Login failed" });
  }
});

module.exports = router;
