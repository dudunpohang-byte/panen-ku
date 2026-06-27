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
        p.*,
        u.name AS farmer_name,
        u.farm_name,
        u.farm_location,
        u.farm_city_id,
        u.status AS farmer_status
      FROM products p
      JOIN users u ON u.id = p.farmer_id
      ORDER BY p.created_at DESC
      LIMIT 200
    `);
        res.json(r.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "server_error" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const r = await (0, db_1.query)("SELECT * FROM products WHERE id = $1", [id]);
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
