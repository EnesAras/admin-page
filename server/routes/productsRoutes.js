// server/routes/productsRoutes.js
const express = require("express");
const {
  listProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../data/store");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await listProducts();
    res.json(products);
  } catch (err) {
    console.error("PRODUCT_FETCH_ERROR:", err);
    res.status(500).json({ error: "ProductFetchError" });
  }
});

router.post("/", async (req, res) => {
  try {
    const created = await addProduct(req.body || {});
    res.status(201).json(created);
  } catch (err) {
    console.error("PRODUCT_CREATE_ERROR:", err);
    res.status(500).json({ error: "ProductCreateError" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await updateProduct(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ error: "ProductNotFound" });
    res.json(updated);
  } catch (err) {
    console.error("PRODUCT_UPDATE_ERROR:", err);
    res.status(500).json({ error: "ProductUpdateError" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted) return res.status(404).json({ error: "ProductNotFound" });
    res.json({ ok: true, id: req.params.id });
  } catch (err) {
    console.error("PRODUCT_DELETE_ERROR:", err);
    res.status(500).json({ error: "ProductDeleteError" });
  }
});

module.exports = router;
