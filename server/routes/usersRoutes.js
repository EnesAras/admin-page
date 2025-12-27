const express = require("express");
const hashPassword = require("../utils/hashPassword");
const { getActorFromHeaders } = require("../utils/actor");
const mongoose = require("mongoose");
const User = require("../models/User");

const router = express.Router();

console.log("[usersRoutes] Mongo users routes mounted");

const ROLE_VALUES = ["Owner", "Admin", "Moderator", "User"];
const STATUS_VALUES = ["ACTIVE", "INACTIVE"];

const isAdminOrOwner = (role) => {
  const normalized = String(role || "").toLowerCase();
  return normalized === "admin" || normalized === "owner";
};

const requireAdminRole = (req, res, next) => {
  const actorRole = getActorFromHeaders(req).role;
  if (!isAdminOrOwner(actorRole)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  return next();
};

const mapUser = (user) => {
  if (!user) return null;
  const entity = user.toObject ? user.toObject() : user;
  const { __v, _id, password, ...rest } = entity;
  return {
    ...rest,
    id: _id ? String(_id) : undefined,
  };
};

router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return res.json(users.map(mapUser));
  } catch (err) {
    console.error("USER_FETCH_ERROR:", err);
    return res.status(500).json({ error: "UserFetchError" });
  }
});

router.post("/", requireAdminRole, async (req, res) => {
  try {
    const { name, email, role = "User", status = "ACTIVE", presence } =
      req.body || {};
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }

    const password = String(req.body.password || "").trim();
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return res
        .status(409)
        .json({ error: "This email is already registered." });
    }
    const passwordHash = await hashPassword(password);
    const normalizedRole = ROLE_VALUES.includes(role)
      ? role
      : "User";
    const normalizedStatus = STATUS_VALUES.includes(status.toUpperCase())
      ? status.toUpperCase()
      : "ACTIVE";

    const created = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: passwordHash,
      role: normalizedRole,
      status: normalizedStatus,
      presence: presence ? String(presence).trim() : undefined,
    });

    return res.status(201).json(mapUser(created));
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

    const { name, email, role, status, presence } = req.body || {};
    const passwordRaw = req.body?.password ? String(req.body.password).trim() : "";

    if (name !== undefined && !String(name).trim()) {
      return res.status(400).json({ error: "Name cannot be empty." });
    }

    if (email !== undefined && !String(email).trim()) {
      return res.status(400).json({ error: "Email cannot be empty." });
    }

    if (passwordRaw && passwordRaw.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters." });
    }

    const updates = {};
    if (name !== undefined) {
      updates.name = String(name).trim();
    }
    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail }).lean();
      if (existing && String(existing._id) !== userId) {
        return res
          .status(409)
          .json({ error: "This email is already registered." });
      }
      updates.email = normalizedEmail;
    }
    if (role !== undefined && ROLE_VALUES.includes(role)) {
      updates.role = role;
    }
    if (status !== undefined) {
      const uppercase = String(status).trim().toUpperCase();
      if (STATUS_VALUES.includes(uppercase)) {
        updates.status = uppercase;
      }
    }
    if (presence !== undefined) {
      updates.presence = String(presence).trim();
    }
    if (passwordRaw) {
      updates.password = await hashPassword(passwordRaw);
    }

    if (!Object.keys(updates).length) {
      return res
        .status(400)
        .json({ error: "No fields provided to update." });
    }

    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) {
      return res.status(404).json({ error: "UserNotFound" });
    }
    return res.json(mapUser(updated));
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
