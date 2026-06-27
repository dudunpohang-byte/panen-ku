"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
exports.getClient = getClient;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.DATABASE_URL || "postgresql://localhost/panenku_dev";
exports.pool = new pg_1.Pool({ connectionString });
async function query(text, params) {
    const res = await exports.pool.query(text, params);
    return res;
}
// Example helper to get a client for transactions
async function getClient() {
    const client = await exports.pool.connect();
    return client;
}
// Optional: Drizzle example (commented)
// import { drizzle } from 'drizzle-orm/node-postgres'
// export const drizzleDb = drizzle(pool)
