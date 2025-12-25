const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required for MongoDB connection");
}

const connectMongo = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5,
      autoIndex: true,
    });
    console.log("[db] Connected to MongoDB");
  } catch (err) {
    console.error("[db] MongoDB connection error:", err);
    throw err;
  }
};

module.exports = {
  connectMongo,
};
