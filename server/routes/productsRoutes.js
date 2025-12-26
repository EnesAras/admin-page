const express = require("express");
const mongoose = require("mongoose");
const Product = require("../db/Product");
const { safeProduct } = require("../data/store");

const STATUS_VALUES = ["active", "inactive"];

const sanitizeStatus = (value) => {
  const normalized =
    typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!STATUS_VALUES.includes(normalized)) {
    return "active";
  }
  return normalized;
};

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return res.json(products.map((product) => safeProduct(product)));
  } catch (err) {
    console.error("PRODUCT_FETCH_ERROR:", err);
    res.status(500).json({ error: "ProductFetchError" });
  }
});

router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    const name = String(payload.name ?? "").trim();
    if (!name) {
      return res.status(400).json({ error: "NameRequired" });
    }

    const priceValue = Number.isFinite(Number(payload.price))
      ? Number(payload.price)
      : 0;
    const stockValue = Number.isFinite(Number(payload.stock))
      ? Number(payload.stock)
      : 0;

    const normalizedCategory =
      String(payload.category ?? "General").trim() || "General";
    const imageValue = String(payload.image || payload.imageUrl || "").trim();

    const created = await Product.create({
      name,
      price: priceValue,
      stock: stockValue,
      category: normalizedCategory,
      status: sanitizeStatus(payload.status),
      image: imageValue,
    });

    return res.status(201).json(safeProduct(created));
  } catch (err) {
    console.error("PRODUCT_CREATE_ERROR:", err);
    return res.status(500).json({ error: "ProductCreateError" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "InvalidProductId" });
    }

    const payload = req.body || {};
    const updates = {};

    if (payload.name !== undefined) {
      const trimmed = String(payload.name ?? "").trim();
      if (!trimmed) {
        return res.status(400).json({ error: "NameRequired" });
      }
      updates.name = trimmed;
    }

    if (payload.category !== undefined) {
      updates.category = String(payload.category ?? "General").trim() || "General";
    }

    if (payload.price !== undefined) {
      const priceValue = Number(payload.price);
      if (!Number.isFinite(priceValue) || priceValue < 0) {
        return res.status(400).json({ error: "InvalidPrice" });
      }
      updates.price = priceValue;
    }

    if (payload.stock !== undefined) {
      const stockValue = Number(payload.stock);
      if (!Number.isFinite(stockValue) || stockValue < 0) {
        return res.status(400).json({ error: "InvalidStock" });
      }
      updates.stock = stockValue;
    }

    if (payload.status !== undefined) {
      updates.status = sanitizeStatus(payload.status);
    }

    if (payload.imageUrl !== undefined || payload.image !== undefined) {
      updates.image = String(payload.image ?? payload.imageUrl ?? "").trim();
    }

    if (!Object.keys(updates).length) {
      return res
        .status(400)
        .json({ error: "NoProductUpdatesProvided" });
    }

    const updated = await Product.findByIdAndUpdate(
      productId,
      updates,
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: "ProductNotFound" });
    }

    return res.json(safeProduct(updated));
  } catch (err) {
    console.error("PRODUCT_UPDATE_ERROR:", err);
    return res.status(500).json({ error: "ProductUpdateError" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "InvalidProductId" });
    }

    const deleted = await Product.findByIdAndDelete(productId).lean();
    if (!deleted) {
      return res.status(404).json({ error: "ProductNotFound" });
    }

    return res.json({ ok: true, id: productId });
  } catch (err) {
    console.error("PRODUCT_DELETE_ERROR:", err);
    return res.status(500).json({ error: "ProductDeleteError" });
  }
});

module.exports = router;
