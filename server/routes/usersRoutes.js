const express = require("express");
const { safeUser, hashPassword } = require("../data/store");
const { getActorFromHeaders } = require("../utils/actor");
const mongoose = require("mongoose");
const User = require("../db/User");

const router = express.Router();

const isAdminOrOwner = (role) => {
  const normalized = String(role || "").toLowerCase();
  return normalized === "admin" || normalized === "owner";
};

// The frontend sets the actor metadata via x-actor-* headers (see lib/api) so we can trust the role here.
const requireAdminRole = (req, res, next) => {
  const actorRole = getActorFromHeaders(req).role;
  if (!isAdminOrOwner(actorRole)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  return next();
};

router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return res.json(users.map((user) => safeUser(user)));
  } catch (err) {
    console.error("USER_FETCH_ERROR:", err);
    return res.status(500).json({ error: "UserFetchError" });
  }
});

router.post("/", requireAdminRole, async (req, res) => {
  try {
    const { name, email, role = "user", status = "Active" } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }

    const password = String(req.body.password || "").trim();
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return res
        .status(409)
        .json({ error: "This email is already registered." });
    }
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
      role,
      status,
    });

    console.log("CREATE USER payload:", {
      name,
      email: normalizedEmail,
      role,
      status,
      passwordLength: password.length,
    });

    return res.status(201).json(safeUser(user));
  } catch (err) {
    console.error("USER_CREATE_ERROR:", err);
    return res.status(500).json({ error: "UserCreateError" });
  }
});

router.put("/:id", requireAdminRole, async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "InvalidUserId" });
    }

    const {
      name,
      email,
      role,
      status,
    } = req.body || {};
    const passwordRaw = req.body?.password
      ? String(req.body.password).trim()
      : "";

    if (name !== undefined && !String(name).trim()) {
      return res
        .status(400)
        .json({ error: "Name cannot be empty." });
    }

    if (email !== undefined && !String(email).trim()) {
      return res
        .status(400)
        .json({ error: "Email cannot be empty." });
    }

    if (passwordRaw && passwordRaw.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters." });
    }

    let normalizedEmail = null;
    if (email !== undefined) {
      normalizedEmail = String(email).trim().toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail }).lean();
      if (existing && String(existing._id) !== userId) {
        return res
          .status(409)
          .json({ error: "This email is already registered." });
      }
    }

    const updates = {};
    if (name !== undefined) {
      updates.name = String(name).trim();
    }
    if (normalizedEmail) {
      updates.email = normalizedEmail;
    }
    if (role !== undefined) {
      updates.role = role;
    }
    if (status !== undefined) {
      updates.status = status;
    }
    if (passwordRaw) {
      updates.password = await hashPassword(passwordRaw);
    }

    if (!Object.keys(updates).length) {
      return res
        .status(400)
        .json({ error: "No fields provided to update." });
    }

    console.log("UPDATE USER payload:", {
      id: userId,
      ...updates,
      passwordLength: passwordRaw ? passwordRaw.length : 0,
    });

    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).lean();
    if (!updated) {
      return res.status(404).json({ error: "UserNotFound" });
    }
    return res.json(safeUser(updated));
  } catch (err) {
    console.error("USER_UPDATE_ERROR:", err);
    return res.status(500).json({ error: "UserUpdateError" });
  }
});

router.delete("/:id", requireAdminRole, async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "InvalidUserId" });
    }
    const deleted = await User.findByIdAndDelete(userId).lean();
    if (!deleted) {
      return res.status(404).json({ error: "UserNotFound" });
    }
    return res.json({ ok: true, id: req.params.id });
  } catch (err) {
    console.error("USER_DELETE_ERROR:", err);
    return res.status(500).json({ error: "UserDeleteError" });
  }
});

module.exports = router;
