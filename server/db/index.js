const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  `postgres://${process.env.PGUSER || "postgres"}:${
    process.env.PGPASSWORD || "postgres"
  }@${process.env.PGHOST || "localhost"}:${
    process.env.PGPORT || 5432
  }/${process.env.PGDATABASE || "admin_panel"}`;

const sslOptions =
  process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : process.env.PGSSLMODE === "require"
    ? { rejectUnauthorized: false }
    : false;

const pool = new Pool({
  connectionString,
  ssl: sslOptions,
});

const connectionUrl = new URL(connectionString);
const dbInfo = `${connectionUrl.hostname}:${connectionUrl.port || 5432}${
  connectionUrl.pathname || ""
}`;

console.log(`[db] connecting to postgres at ${dbInfo}`);

pool.on("connect", () => {
  console.log(`[db] connected ${dbInfo}`);
});

const query = async (text, params) => {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
};

module.exports = {
  query,
  pool,
};
