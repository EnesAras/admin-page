// server/routes/productsRoutes.js
const express = require("express");
const router = express.Router();

// TEMP: minimal route so server boots
router.get("/", (req, res) => {
  res.json([]);
});

module.exports = router;
