import express from "express";
import { query, withRetry } from "../db-pool";

const router = express.Router();

/**
 * Create shipment for an order
 */
router.post("/", async (req, res) => {
  const { order_id, farmer_id, courier_name, tracking_number, shipping_service, notes } = req.body;
  if (!order_id || !farmer_id) {
    return res.status(400).json({ error: "invalid_payload" });
  }

  try {
    const r = await query(
      `INSERT INTO shipments 
       (order_id, farmer_id, buyer_id, courier_name, tracking_number, shipping_service, status, notes)
       SELECT $1, $2, buyer_id, $3, $4, $5, 'pending_pickup', $6
       FROM orders WHERE id = $1 AND (SELECT status FROM orders WHERE id = $1) = 'dibayar'
       RETURNING id`,
      [order_id, farmer_id, courier_name || "petani_sendiri", tracking_number, shipping_service, notes],
    );
    
    if (r.rowCount === 0) {
      return res.status(400).json({ error: "order_not_ready_for_shipping" });
    }

    res.status(201).json({ id: r.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

/**
 * Update shipment status
 */
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, location, notes, proof_of_delivery } = req.body;
  
  try {
    const r = await query(
      `UPDATE shipments 
       SET status = $1, 
           location = $2, 
           notes = $3,
           proof_of_delivery = $4,
           updated_at = now()
       WHERE id = $5
       RETURNING id, order_id, status`,
      [status, location, notes, proof_of_delivery, id],
    );

    if (r.rowCount === 0) {
      return res.status(404).json({ error: "shipment_not_found" });
    }

    await query(
      `INSERT INTO shipment_events (shipment_id, event_type, location, notes)
       VALUES ($1, $2, $3, $4)`,
      [id, status, location, notes],
    );

    if (status === "delivered") {
      await query(
        "UPDATE orders SET status = 'dikirim', updated_at = now() WHERE id = $1",
        [r.rows[0].order_id],
      );
    }

    res.json({ id: r.rows[0].id, status: r.rows[0].status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

/**
 * Get shipment by order ID
 */
router.get("/order/:orderId", async (req, res) => {
  const { orderId } = req.params;
  try {
    const r = await query(
      `SELECT s.*, 
       array_agg(se ORDER BY se.timestamp) as events
       FROM shipments s
       LEFT JOIN shipment_events se ON se.shipment_id = s.id
       WHERE s.order_id = $1
       GROUP BY s.id`,
      [orderId],
    );
    
    if (r.rowCount === 0) {
      return res.status(404).json({ error: "shipment_not_found" });
    }
    
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

/**
 * Farmer gets shipments for their products
 */
router.get("/farmer/:farmerId", async (req, res) => {
  const { farmerId } = req.params;
  try {
    const r = await query(
      `SELECT s.*, o.buyer_name, o.shipping_address
       FROM shipments s
       JOIN orders o ON o.id = s.order_id
       WHERE s.farmer_id = $1
       ORDER BY s.created_at DESC`,
      [farmerId],
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;