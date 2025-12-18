const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgres://${process.env.PGUSER || "postgres"}:${
      process.env.PGPASSWORD || "postgres"
    }@${process.env.PGHOST || "localhost"}:${
      process.env.PGPORT || 5432
    }/${process.env.PGDATABASE || "admin_panel"}`,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : process.env.PGSSLMODE === "require"
      ? { rejectUnauthorized: false }
      : false,
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
