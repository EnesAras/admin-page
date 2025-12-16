const express = require("express");
const {
  listOrders,
  addOrder,
  updateOrder,
  deleteOrder,
} = require("../data/mockStore");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(listOrders());
});

router.post("/", (req, res) => {
  const created = addOrder(req.body || {});
  res.status(201).json(created);
});

router.put("/:id", (req, res) => {
  const updated = updateOrder(req.params.id, req.body || {});
  if (!updated) {
    return res.status(404).json({ error: "OrderNotFound" });
  }
  res.json(updated);
});

router.delete("/:id", (req, res) => {
  const success = deleteOrder(req.params.id);
  if (!success) {
    return res.status(404).json({ error: "OrderNotFound" });
  }
  res.json({ ok: true, id: req.params.id });
});

module.exports = router;
