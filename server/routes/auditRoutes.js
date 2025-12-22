const express = require("express");
const { listAuditEvents } = require("../data/auditLog");

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const limitParam = Number(req.query.limit);
    const events = listAuditEvents(limitParam);
    res.json({ events });
  } catch (err) {
    console.error("AUDIT_FETCH_ERROR:", err);
    res.status(500).json({ error: "AuditFetchError" });
  }
});

module.exports = router;
