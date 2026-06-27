import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..", "..");

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    process.env[key] ||= value;
  }
}

function quoteIdentifier(value) {
  if (!/^[A-Za-z0-9_]+$/.test(value)) {
    throw new Error(`Unsafe database name: ${value}`);
  }
  return `"${value.replace(/"/g, '""')}"`;
}

async function runSql(connectionString, sql) {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}

async function main() {
  loadEnv(path.join(rootDir, "server", ".env"));

  const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres@localhost:5432/panenku_dev";
  const target = new URL(databaseUrl);
  const databaseName = target.pathname.replace(/^\//, "");
  if (!databaseName) throw new Error("DATABASE_URL must include a database name");

  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = "/postgres";

  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  try {
    const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [databaseName]);
    if (exists.rowCount === 0) {
      await admin.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
      console.log(`Created database ${databaseName}`);
    } else {
      console.log(`Database ${databaseName} already exists`);
    }
  } finally {
    await admin.end();
  }

  const schemaSql = fs.readFileSync(path.join(rootDir, "db", "schema.sql"), "utf8");
  const seedSql = fs.readFileSync(path.join(rootDir, "db", "seed.sql"), "utf8");

  await runSql(databaseUrl, schemaSql);
  console.log("Schema applied");

  await runSql(databaseUrl, seedSql);
  console.log("Seed applied");

  const verify = new Client({ connectionString: databaseUrl });
  await verify.connect();
  try {
    const tables = await verify.query("SELECT COUNT(*)::int AS count FROM information_schema.tables WHERE table_schema = 'public'");
    const users = await verify.query("SELECT COUNT(*)::int AS count FROM users");
    const products = await verify.query("SELECT COUNT(*)::int AS count FROM products");
    console.log(`Verified: ${tables.rows[0].count} tables, ${users.rows[0].count} users, ${products.rows[0].count} products`);
  } finally {
    await verify.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
