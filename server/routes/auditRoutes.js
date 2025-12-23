const express = require("express");
const { listAuditEvents, logAuditEvent } = require("../data/auditLog");
const { getActorFromHeaders } = require("../utils/actor");

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

router.get("/", requireAdminRole, (req, res) => {
  try {
    const limitParam = Number(req.query.limit);
    const events = listAuditEvents(limitParam);
    res.json({ events });
  } catch (err) {
    console.error("AUDIT_FETCH_ERROR:", err);
    res.status(500).json({ error: "AuditFetchError" });
  }
});

router.post("/", async (req, res) => {
  try {
    const actor = getActorFromHeaders(req);
    const { type, route } = req.body || {};
    if (!type) {
      return res.status(400).json({ error: "TypeMissing" });
    }

    logAuditEvent({
      actor,
      action: type,
      meta: { route },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("AUDIT_LOG_ERROR:", err);
    res.status(500).json({ error: "AuditLogError" });
  }
});

module.exports = router;
