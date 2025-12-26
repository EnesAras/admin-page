const mongoose = require("mongoose");

const ROLE_VALUES = ["Owner", "Admin", "Moderator", "User"];
const STATUS_VALUES = ["ACTIVE", "INACTIVE"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: "User",
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: "ACTIVE",
    },
    presence: {
      type: String,
      default: "Unknown",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toClient = function () {
  const { __v, _id, password, ...rest } = this.toObject();
  return {
    ...rest,
    id: _id ? String(_id) : undefined,
  };
};

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);
