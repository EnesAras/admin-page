// server/routes/productsRoutes.js
const express = require("express");
const {
  listProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../data/mockStore");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(listProducts());
});

router.post("/", (req, res) => {
  const created = addProduct(req.body || {});
  res.status(201).json(created);
});

router.put("/:id", (req, res) => {
  const updated = updateProduct(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: "ProductNotFound" });
  res.json(updated);
});

router.delete("/:id", (req, res) => {
  const deleted = deleteProduct(req.params.id);
  if (!deleted) return res.status(404).json({ error: "ProductNotFound" });
  res.json({ ok: true, id: req.params.id });
});

module.exports = router;
