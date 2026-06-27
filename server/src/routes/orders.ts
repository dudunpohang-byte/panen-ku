import express from "express";
import { getClient, query, withRetry } from "../db-pool";

const router = express.Router();

/**
 * Create order with race condition prevention
 * Uses SELECT FOR UPDATE SKIP LOCKED for stock reservation
 */
router.post("/", async (req, res) => {
  const payload = req.body;
  if (!payload || !Array.isArray(payload.items) || !payload.buyer_id) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  try {
    const orderId = await withRetry(async () => {
      const client = await getClient();
      try {
        await client.query("BEGIN ISOLATION LEVEL READ COMMITTED");

        const productIds = payload.items.map((it: any) => it.product_id);
        const stockCheck = await client.query(
          `SELECT id, price, stock, farmer_id FROM products 
           WHERE id = ANY($1) 
           FOR UPDATE SKIP LOCKED`,
          [productIds],
        );

        const stockMap = new Map(
          stockCheck.rows.map((r: any) => [r.id, r]),
        );

        for (const it of payload.items) {
          const prod = stockMap.get(it.product_id);
          if (!prod) throw new Error(`product_not_found:${it.product_id}`);
          if (prod.stock < it.qty) throw new Error(`insufficient_stock:${it.product_id}`);
        }

        let total = 0;
        for (const it of payload.items) {
          const prod = stockMap.get(it.product_id);
          total += Number(prod.price) * Number(it.qty);
        }

        const orderRes = await client.query(
          "INSERT INTO orders (buyer_id, buyer_name, total_amount, status, shipping_address) VALUES ($1,$2,$3,'dibayar',$4) RETURNING id",
          [payload.buyer_id, payload.buyer_name || null, total, payload.shipping_address || null],
        );
        const orderId = orderRes.rows[0].id;

        for (const it of payload.items) {
          const prod = stockMap.get(it.product_id);
          await client.query(
            "INSERT INTO order_items (order_id, product_id, farmer_id, price, qty) VALUES ($1,$2,$3,$4,$5)",
            [orderId, it.product_id, prod.farmer_id, prod.price, it.qty],
          );
          await client.query(
            "UPDATE products SET stock = stock - $1, sold = sold + $1 WHERE id = $2",
            [it.qty, it.product_id],
          );
        }

        await client.query("COMMIT");
        return orderId;
      } catch (err: any) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    });

    res.status(201).json({ id: orderId });
  } catch (err: any) {
    console.error(err);
    if (String(err.message).startsWith("product_not_found"))
      return res.status(404).json({ error: err.message });
    if (String(err.message).startsWith("insufficient_stock"))
      return res.status(400).json({ error: err.message });
    if (err.message === "CONCURRENT_MODIFICATION_RETRY")
      return res.status(409).json({ error: "concurrent_modification", retry: true });
    res.status(500).json({ error: "server_error" });
  }
});

/**
 * Get order by ID with items
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const r = await query(
      `SELECT o.*, json_agg(oi ORDER BY oi.created_at) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1
       GROUP BY o.id`,
      [id],
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "not_found" });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

/**
 * Update order status (for farmer/admin workflow)
 */
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, farmer_id } = req.body;
  try {
    const r = await query(
      "UPDATE orders SET status = $1, updated_at = now() WHERE id = $2 RETURNING id, farmer_id",
      [status, id],
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "not_found" });
    res.json({ id, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

/**
 * Buyer gets their orders
 */
router.get("/buyer/:buyerId", async (req, res) => {
  const { buyerId } = req.params;
  try {
    const r = await query(
      `SELECT o.*, json_agg(oi ORDER BY oi.created_at) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.buyer_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [buyerId],
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;