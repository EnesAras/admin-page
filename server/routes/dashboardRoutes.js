const express = require("express");
const { getDashboardStats } = require("../data/store");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error("DASHBOARD_ERROR:", err);
    res.status(500).json({ error: "DashboardError" });
  }
});

module.exports = router;
