const express = require("express");
const mongoose = require("mongoose");
const { logAuditEvent } = require("../data/auditLog");
const { getActorFromHeaders } = require("../utils/actor");
const Order = require("../models/Order");

const router = express.Router();

const ORDER_STATUS_VALUES = ["PENDING", "SHIPPED", "CANCELLED"];
const PAYMENT_STATUS_VALUES = ["PAID", "UNPAID", "REFUNDED"];

const normalizeEnum = (value, allowed, fallback) => {
  if (typeof value !== "string") {
    return fallback;
  }
  const cleaned = value.trim().toUpperCase();
  if (allowed.includes(cleaned)) {
    return cleaned;
  }
  return fallback;
};

const toOrderClient = (order) => {
  if (!order) return null;
  if (typeof order.toClient === "function") {
    return order.toClient();
  }
  const { __v, _id, ...rest } = order;
  return {
    ...rest,
    id: _id ? String(_id) : rest.id,
  };
};

const sanitizeItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    productId: item?.productId ? String(item.productId).trim() : undefined,
    name: item?.name ? String(item.name).trim() : undefined,
    qty:
      typeof item?.qty === "number" && Number.isFinite(item.qty)
        ? item.qty
        : 0,
    price:
      typeof item?.price === "number" && Number.isFinite(item.price)
        ? item.price
        : 0,
  }));
};

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return res.json(orders.map(toOrderClient));
  } catch (err) {
    console.error("ORDER_FETCH_ERROR:", err);
    return res.status(500).json({ error: "OrderFetchError" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { customer, items, total, currency, status, paymentStatus } =
      req.body || {};
    if (!customer || !String(customer).trim()) {
      return res.status(400).json({ error: "CustomerRequired" });
    }

    const normalizedTotal =
      typeof total === "number" && Number.isFinite(total) ? total : 0;
    if (normalizedTotal < 0) {
      return res.status(400).json({ error: "TotalMustBePositive" });
    }

    const created = await Order.create({
      customer: String(customer).trim(),
      items: sanitizeItems(items),
      total: normalizedTotal,
      currency: currency ? String(currency).trim() : "EUR",
      status: normalizeEnum(status, ORDER_STATUS_VALUES, "PENDING"),
      paymentStatus: normalizeEnum(
        paymentStatus,
        PAYMENT_STATUS_VALUES,
        "PAID"
      ),
    });

    return res.status(201).json(toOrderClient(created));
  } catch (err) {
    console.error("ORDER_CREATE_ERROR:", err);
    return res.status(500).json({ error: "OrderCreateError" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "InvalidOrderId" });
    }

    const { customer, items, total, currency, status, paymentStatus } =
      req.body || {};

    if (customer !== undefined && !String(customer).trim()) {
      return res.status(400).json({ error: "CustomerCannotBeEmpty" });
    }

    if (
      total !== undefined &&
      !(typeof total === "number" && Number.isFinite(total))
    ) {
      return res.status(400).json({ error: "TotalMustBeNumeric" });
    }

    const updates = {};
    if (customer !== undefined) {
      updates.customer = String(customer).trim();
    }
    if (items !== undefined) {
      updates.items = sanitizeItems(items);
    }
    if (total !== undefined) {
      updates.total = total;
    }
    if (currency !== undefined) {
      updates.currency = String(currency).trim();
    }
    if (status !== undefined) {
      updates.status = normalizeEnum(status, ORDER_STATUS_VALUES, "PENDING");
    }
    if (paymentStatus !== undefined) {
      updates.paymentStatus = normalizeEnum(
        paymentStatus,
        PAYMENT_STATUS_VALUES,
        "PAID"
      );
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: "NoFieldsToUpdate" });
    }

    const updated = await Order.findByIdAndUpdate(orderId, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ error: "OrderNotFound" });
    }

    if (updates.status) {
      try {
        logAuditEvent({
          actor: getActorFromHeaders(req),
          action: "ORDER_STATUS_CHANGED",
          entityType: "order",
          entityId: updated.id,
          meta: { status: updated.status },
        });
      } catch (auditErr) {
        console.warn("Audit log error (order status):", auditErr);
      }
    }

    return res.json(toOrderClient(updated));
  } catch (err) {
    console.error("ORDER_UPDATE_ERROR:", err);
    return res.status(500).json({ error: "OrderUpdateError" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "InvalidOrderId" });
    }

    const deleted = await Order.findByIdAndDelete(orderId).lean();
    if (!deleted) {
      return res.status(404).json({ error: "OrderNotFound" });
    }

    return res.json({ ok: true, id: orderId });
  } catch (err) {
    console.error("ORDER_DELETE_ERROR:", err);
    return res.status(500).json({ error: "OrderDeleteError" });
  }
});

module.exports = router;
