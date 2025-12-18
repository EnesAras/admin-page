// server/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const productsRoutes = require("./routes/productsRoutes");
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { initStore } = require("./data/store");

dotenv.config();

const app = express();
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = Number(process.env.PORT || 5000);
const DEFAULT_FRONTEND_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];

// keep CRA dev-server origins in sync with this list.
const allowedOrigins = (
  (process.env.FRONTEND_ORIGINS ?? DEFAULT_FRONTEND_ORIGINS.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, environment: NODE_ENV });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/dashboard", dashboardRoutes);

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
