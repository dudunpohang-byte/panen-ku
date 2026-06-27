"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.products = exports.users = exports.db = void 0;
exports.getProductsDrizzle = getProductsDrizzle;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_core_1 = require("drizzle-orm/pg-core");
const db_1 = require("./db");
// Initialize Drizzle with existing pg Pool
exports.db = (0, node_postgres_1.drizzle)(db_1.pool);
// Example table definitions (can be used for typed queries)
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    email: (0, pg_core_1.text)("email").notNull(),
    name: (0, pg_core_1.text)("name"),
    role: (0, pg_core_1.text)("role").notNull(),
    balance: (0, pg_core_1.numeric)("balance", { precision: 12, scale: 2 }).default("0"),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.products = (0, pg_core_1.pgTable)("products", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    farmer_id: (0, pg_core_1.uuid)("farmer_id").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    price: (0, pg_core_1.numeric)("price", { precision: 12, scale: 2 }).notNull(),
    stock: (0, pg_core_1.integer)("stock").notNull().default(0),
    unit: (0, pg_core_1.varchar)("unit", { length: 32 }).default('pcs'),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Example usage helper
async function getProductsDrizzle(limit = 100) {
    return await exports.db.select().from(exports.products).limit(limit).execute();
}
