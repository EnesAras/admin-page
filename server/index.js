// server/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const productsRoutes = require("./routes/productsRoutes");
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const auditRoutes = require("./routes/auditRoutes");
const { initStore } = require("./data/store");

dotenv.config();

const app = express();
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = Number(process.env.PORT || 5000);
const DEFAULT_DEV_FRONTEND_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3002",
];

const originSource =
  process.env.FRONTEND_ORIGINS?.trim() ||
  (NODE_ENV === "development" ? DEFAULT_DEV_FRONTEND_ORIGINS.join(",") : "");

const allowedOrigins = originSource
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (NODE_ENV === "production" && allowedOrigins.length === 0) {
  console.warn(
    "[server] FRONTEND_ORIGINS is empty in production; cross-origin requests will be blocked."
  );
}

console.log(`[server] NODE_ENV=${NODE_ENV}`);
console.log(
  `[server] allowed origins: ${
    allowedOrigins.length ? allowedOrigins.join(", ") : "none (CORS will reject non-null origins)"
  }`
);

const corsOptions = {
  origin: (origin, callback) => {
    console.log("CORS origin:", origin);

    if (NODE_ENV !== "production") {
      return callback(null, true);
    }

    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin =
      typeof origin === "string" ? origin.trim() : origin;

    if (
      allowedOrigins.includes("*") ||
      (typeof normalizedOrigin === "string" &&
        allowedOrigins.includes(normalizedOrigin))
    ) {
      return callback(null, true);
    }

    const err = new Error("CORS_NOT_ALLOWED");
    err.status = 403;
    return callback(err);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, env: NODE_ENV });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit", auditRoutes);

app.use((err, req, res, next) => {
  if (err?.message === "CORS_NOT_ALLOWED") {
    console.error("CORS REJECTED", err?.message, err?.stack || "");
    if (res.headersSent) {
      return next(err);
    }
    return res.status(err.status || 403).json({ error: "CorsNotAllowed" });
  }

  console.error("UNHANDLED ERROR:", err?.message || err, err?.stack || "");
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: "Internal Server Error" });
});

const startServer = async () => {
  try {
    await initStore();
  } catch (err) {
    console.error("Failed to initialize data store:", err);
    process.exit(1);
  }

  const listener = app.listen(PORT, "0.0.0.0", () => {
    const address = listener.address();
    if (!address) {
      console.log(`API running in ${NODE_ENV} mode (PID ${process.pid})`);
      console.log(`  → Node ${process.version}, cwd=${process.cwd()}`);
      return;
    }

    const host =
      typeof address === "string"
        ? address
        : `${address.address === "::" ? "0.0.0.0" : address.address}`;

    const timestamp = new Date().toISOString();
    console.log(`API running in ${NODE_ENV} mode (PID ${process.pid})`);
    console.log(
      `  → Bound to http://${host}:${address.port} ` +
        `(allowed origins: ${allowedOrigins.join(", ")})`
    );
    console.log(`  → Node ${process.version}, cwd=${process.cwd()}`);
    console.log(`  → ${timestamp}`);
  });
};

startServer();
