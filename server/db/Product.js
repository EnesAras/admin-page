const mongoose = require("mongoose");

const STATUS_VALUES = ["Active", "Hidden", "OutOfStock"];

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
    stock: {
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
    fandom: {
      type: String,
      trim: true,
      default: "General",
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: "Active",
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
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
