const mongoose = require("mongoose");

const STATUS_VALUES = ["active", "inactive"];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product must have a name"],
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    stock: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      lowercase: true,
      default: "active",
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    toJSON: { virtuals: false },
    toObject: { virtuals: false },
  }
);

productSchema.methods.toClient = function () {
  const { __v, _id, ...rest } = this.toObject();
  return {
    ...rest,
    id: _id ? String(_id) : undefined,
  };
};

module.exports = mongoose.model("Product", productSchema);
