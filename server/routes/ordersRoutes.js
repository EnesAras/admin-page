const express = require("express");
const {
  listOrders,
  addOrder,
  updateOrder,
  deleteOrder,
} = require("../data/store");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const orders = await listOrders();
    res.json(orders);
  } catch (err) {
    console.error("ORDER_FETCH_ERROR:", err);
    res.status(500).json({ error: "OrderFetchError" });
  }
});

router.post("/", async (req, res) => {
  try {
    const created = await addOrder(req.body || {});
    res.status(201).json(created);
  } catch (err) {
    console.error("ORDER_CREATE_ERROR:", err);
    res.status(500).json({ error: "OrderCreateError" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await updateOrder(req.params.id, req.body || {});
    if (!updated) {
      return res.status(404).json({ error: "OrderNotFound" });
    }
    res.json(updated);
  } catch (err) {
    console.error("ORDER_UPDATE_ERROR:", err);
    res.status(500).json({ error: "OrderUpdateError" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const success = await deleteOrder(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "OrderNotFound" });
    }
    res.json({ ok: true, id: req.params.id });
  } catch (err) {
    console.error("ORDER_DELETE_ERROR:", err);
    res.status(500).json({ error: "OrderDeleteError" });
  }
});

module.exports = router;
