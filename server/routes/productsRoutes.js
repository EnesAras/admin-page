// server/routes/productsRoutes.js
const express = require("express");
const router = express.Router();
let products = require("../data/products");

router.get("/", (req, res) => {
  res.json({ products });
});

router.post("/", (req, res) => {
  const payload = req.body || {};
  const safePrice = Number(payload.price);
  const safeStock = Number(payload.stock);
  const validStatus = ["Active", "Hidden", "OutOfStock"];
  const newProduct = {
    id: String(Date.now()),
    name: String(payload.name ?? "Untitled Product"),
    category: String(payload.category ?? "General"),
    fandom: String(payload.fandom ?? "General"),
    price: Number.isFinite(safePrice) ? safePrice : 0,
    stock: Number.isFinite(safeStock) ? safeStock : 0,
    status: validStatus.includes(payload.status) ? payload.status : "Active",
  };

  products.unshift(newProduct);
  res.status(201).json(newProduct);
});

router.put("/:id", (req, res) => {
  const id = String(req.params.id);
  const idx = products.findIndex((p) => String(p.id) === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  products[idx] = { ...products[idx], ...req.body, id: products[idx].id };
  res.json(products[idx]);
});

router.delete("/:id", (req, res) => {
  const id = String(req.params.id);
  const idx = products.findIndex((p) => String(p.id) === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  const deletedId = products[idx].id;
  products = products.filter((p) => String(p.id) !== id);
  res.json({ ok: true, id: deletedId });
});

module.exports = router;
