const express = require("express");
const { getPresenceRecords, markUserLogin, markUserLogout } = require("../data/store");
const { logAuditEvent } = require("../data/auditLog");
const { getActorFromHeaders } = require("../utils/actor");
const User = require("../db/User");
const safeUser = require("../utils/safeUser");

const router = express.Router();

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

router.post("/login", async (req, res) => {
  try {
    const actor = getActorFromHeaders(req);
    const candidateId = actor.id || req.body?.userId;
    const userId = candidateId ? String(candidateId) : null;
    if (!userId) {
      return res.status(400).json({ error: "UserIdRequired" });
    }

    const presence = markUserLogin(userId);
    console.log("Presence login for userId:", userId);
    logAuditEvent({
      actor,
      action: "LOGIN",
      meta: { userId },
    });
    res.json({ presence });
  } catch (err) {
    console.error("PRESENCE_LOGIN_ERROR:", err);
    res.status(500).json({ error: "PresenceLoginError" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const actor = getActorFromHeaders(req);
    const candidateId = actor.id || req.body?.userId;
    const userId = candidateId ? String(candidateId) : null;
    if (!userId) {
      return res.status(400).json({ error: "UserIdRequired" });
    }

    const presence = markUserLogout(userId);
    logAuditEvent({
      actor,
      action: "LOGOUT",
      meta: { userId },
    });
    res.json({ presence });
  } catch (err) {
    console.error("PRESENCE_LOGOUT_ERROR:", err);
    res.status(500).json({ error: "PresenceLogoutError" });
  }
});

router.get("/users", requireAdminRole, async (req, res) => {
  try {
    const users = await User.find().sort({ id: 1 }).lean();
    const presenceRecords = getPresenceRecords();
    const presenceMap = new Map(
      presenceRecords.map((record) => [String(record.userId), record])
    );

    console.log(
      "Presence users response keys:",
      Array.from(presenceMap.keys()).map((key) => String(key))
    );

    const enriched = users
      .map((user) => {
      const safe = safeUser(user);
      if (!safe) return null;
      const userId = safe.id ? String(safe.id) : null;
      const presence = userId ? presenceMap.get(userId) || null : null;
      return {
        ...safe,
        presence,
      };
      })
      .filter(Boolean);
    res.json({ users: enriched });
  } catch (err) {
    console.error("PRESENCE_USERS_ERROR:", err);
    res.status(500).json({ error: "PresenceUsersError" });
  }
});

module.exports = router;
