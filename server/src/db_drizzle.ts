import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, integer, numeric, timestamp, varchar, uuid } from "drizzle-orm/pg-core";
import { pool } from "./db";

// Initialize Drizzle with existing pg Pool
export const db = drizzle(pool);

// Example table definitions (can be used for typed queries)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  name: text("name"),
  role: text("role").notNull(),
  balance: numeric("balance", { precision: 12, scale: 2 }).default("0"),
  created_at: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  farmer_id: uuid("farmer_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  unit: varchar("unit", { length: 32 }).default('pcs'),
  created_at: timestamp("created_at").defaultNow(),
});

// Example usage helper
export async function getProductsDrizzle(limit = 100) {
  return await db.select().from(products).limit(limit).execute();
}
