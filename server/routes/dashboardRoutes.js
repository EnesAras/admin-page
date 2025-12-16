const express = require("express");
const { getDashboardStats } = require("../data/mockStore");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(getDashboardStats());
});

module.exports = router;
