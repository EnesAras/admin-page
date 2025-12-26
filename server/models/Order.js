const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    qty: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const ORDER_STATUSES = ["PENDING", "SHIPPED", "CANCELLED"];
const PAYMENT_STATUS = ["PAID", "UNPAID", "REFUNDED"];

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      required: true,
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      trim: true,
      default: "EUR",
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "PENDING",
      uppercase: true,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: "PAID",
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.methods.toClient = function () {
  const { __v, _id, ...rest } = this.toObject();
  return {
    ...rest,
    id: _id ? String(_id) : undefined,
  };
};

module.exports =
  mongoose.models.Order || mongoose.model("Order", orderSchema);
