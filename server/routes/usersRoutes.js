const express = require("express");
const {
  listUsers,
  addUser,
  updateUser,
  deleteUser,
  findUserByEmail,
} = require("../data/store");
const { getActorFromHeaders } = require("../utils/actor");

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
    const users = await listUsers();
    res.json(users);
  } catch (err) {
    console.error("USER_FETCH_ERROR:", err);
    res.status(500).json({ error: "UserFetchError" });
  }
});

router.post("/", requireAdminRole, async (req, res) => {
  try {
    const { name, email } = req.body || {};
    if (!name || !email) {
      return res
        .status(400)
        .json({ error: "Name and email are required." });
    }

    const password = String(req.body.password || "").trim();
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters." });
    }

    const existing = await findUserByEmail(String(email).toLowerCase());
    if (existing) {
      return res
        .status(409)
        .json({ error: "This email is already registered." });
    }

    const payload = { ...(req.body || {}), password };
    console.log("CREATE USER payload:", {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      status: payload.status,
      passwordLength: password.length,
    });
    const created = await addUser(payload);
    res.status(201).json(created);
  } catch (err) {
    console.error("USER_CREATE_ERROR:", err);
    res.status(500).json({ error: "UserCreateError" });
  }
});

router.put("/:id", requireAdminRole, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const name = req.body?.name ? String(req.body.name).trim() : null;
    const email = req.body?.email
      ? String(req.body.email).trim().toLowerCase()
      : null;
    const role = req.body?.role || "user";
    const status = req.body?.status || "Active";
    const passwordRaw = req.body?.password
      ? String(req.body.password).trim()
      : "";

    if (!name || !email) {
      return res
        .status(400)
        .json({ error: "Name and email are required." });
    }

    if (passwordRaw && passwordRaw.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters." });
    }

    const existing = await findUserByEmail(email);
    if (existing && existing.id !== userId) {
      return res
        .status(409)
        .json({ error: "This email is already registered." });
    }

    const payload = {
      name,
      email,
      role,
      status,
    };
    if (passwordRaw) {
      payload.password = passwordRaw;
    }

    console.log("UPDATE USER payload:", {
      id: userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      status: payload.status,
      passwordLength: passwordRaw ? passwordRaw.length : 0,
    });

    const updated = await updateUser(userId, payload);
    if (!updated) {
      return res.status(404).json({ error: "UserNotFound" });
    }
    res.json(updated);
  } catch (err) {
    console.error("USER_UPDATE_ERROR:", err);
    res.status(500).json({ error: "UserUpdateError" });
  }
});

router.delete("/:id", requireAdminRole, async (req, res) => {
  try {
    const success = await deleteUser(Number(req.params.id));
    if (!success) return res.status(404).json({ error: "UserNotFound" });
    res.json({ ok: true, id: Number(req.params.id) });
  } catch (err) {
    console.error("USER_DELETE_ERROR:", err);
    res.status(500).json({ error: "UserDeleteError" });
  }
});

module.exports = router;
