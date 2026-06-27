"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const router = express_1.default.Router();
/*
Expected body:
{
  buyer_id: string,
  buyer_name: string,
  shipping_address?: string,
  items: [{ product_id: string, qty: number }]
}
*/
router.post("/", async (req, res) => {
    const payload = req.body;
    if (!payload || !Array.isArray(payload.items) || !payload.buyer_id) {
        return res.status(400).json({ error: "invalid_payload" });
    }
    const client = await (0, db_1.getClient)();
    try {
        await client.query("BEGIN");
        // calculate total
        let total = 0;
        for (const it of payload.items) {
            const pr = await client.query("SELECT price, stock FROM products WHERE id = $1 FOR UPDATE", [it.product_id]);
            if (pr.rowCount === 0)
                throw new Error(`product_not_found:${it.product_id}`);
            const { price, stock } = pr.rows[0];
            if (stock < it.qty)
                throw new Error(`insufficient_stock:${it.product_id}`);
            total += Number(price) * Number(it.qty);
        }
        const orderRes = await client.query("INSERT INTO orders (buyer_id, buyer_name, total_amount, status, shipping_address) VALUES ($1,$2,$3,'dibayar',$4) RETURNING id", [payload.buyer_id, payload.buyer_name || null, total, payload.shipping_address || null]);
        const orderId = orderRes.rows[0].id;
        for (const it of payload.items) {
            const pr = await client.query("SELECT price, stock, farmer_id FROM products WHERE id = $1 FOR UPDATE", [it.product_id]);
            const { price, stock, farmer_id } = pr.rows[0];
            await client.query("INSERT INTO order_items (order_id, product_id, farmer_id, price, qty) VALUES ($1,$2,$3,$4,$5)", [orderId, it.product_id, farmer_id, price, it.qty]);
            await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [it.qty, it.product_id]);
        }
        await client.query("COMMIT");
        res.status(201).json({ id: orderId });
    }
    catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        if (String(err.message).startsWith("product_not_found"))
            return res.status(404).json({ error: err.message });
        if (String(err.message).startsWith("insufficient_stock"))
            return res.status(400).json({ error: err.message });
        res.status(500).json({ error: "server_error" });
    }
    finally {
        client.release();
    }
});
exports.default = router;
