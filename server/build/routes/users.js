"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    try {
        const r = await (0, db_1.query)(`
      SELECT
        id, email, phone, name, role, avatar, farm_name, farm_location,
        farm_city_id, full_address, farm_description, farm_established,
        certifications, status, balance, pending_balance, certificate_image,
        shipping_packaging_method, created_at, updated_at
      FROM users
      ORDER BY created_at ASC
    `);
        res.json(r.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "server_error" });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { phone, pin, email, password } = req.body || {};
        const r = phone
            ? await (0, db_1.query)(`SELECT id, email, phone, name, role, avatar, farm_name, farm_location,
            farm_city_id, full_address, farm_description, farm_established,
            certifications, status, balance, pending_balance, certificate_image,
            shipping_packaging_method, created_at, updated_at
           FROM users
           WHERE phone = $1 AND pin = $2`, [phone, pin])
            : await (0, db_1.query)(`SELECT id, email, phone, name, role, avatar, farm_name, farm_location,
            farm_city_id, full_address, farm_description, farm_established,
            certifications, status, balance, pending_balance, certificate_image,
            shipping_packaging_method, created_at, updated_at
           FROM users
           WHERE email = $1 AND password_hash = $2`, [email, password]);
        if (r.rowCount === 0)
            return res.status(401).json({ error: "invalid_credentials" });
        res.json(r.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "server_error" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const r = await (0, db_1.query)(`
      SELECT
        id, email, phone, name, role, avatar, farm_name, farm_location,
        farm_city_id, full_address, farm_description, farm_established,
        certifications, status, balance, pending_balance, certificate_image,
        shipping_packaging_method, created_at, updated_at
      FROM users
      WHERE id = $1
    `, [id]);
        if (r.rowCount === 0)
            return res.status(404).json({ error: "not_found" });
        res.json(r.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "server_error" });
    }
});
exports.default = router;
