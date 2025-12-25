const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["admin", "owner", "moderator", "user"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

userSchema.methods.toClient = function () {
  const { password, __v, _id, ...rest } = this.toObject();
  return {
    ...rest,
    id: _id ? String(_id) : undefined,
  };
};

module.exports = mongoose.model("User", userSchema);
