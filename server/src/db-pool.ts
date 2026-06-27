import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres@localhost:5432/panenku";

export const pool = new Pool({
  connectionString,
  max: 50,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  maxUses: 7500,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

pool.on("connect", () => {
  console.log("New PostgreSQL connection pool client connected");
});

export async function query(text: string, params?: any[]) {
  const res = await pool.query(text, params);
  return res;
}

export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getClient();
  try {
    await client.query("BEGIN ISOLATION LEVEL READ COMMITTED");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function withSerializableTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getClient();
  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error: any) {
    await client.query("ROLLBACK");
    if (error.code === "40001") {
      throw new Error("CONCURRENT_MODIFICATION_RETRY");
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.message === "CONCURRENT_MODIFICATION_RETRY" && i < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, Math.random() * 100));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});