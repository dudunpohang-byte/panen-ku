import express from "express";
import { query } from "../db";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const r = await query(`
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const r = await query("SELECT * FROM products WHERE id = $1", [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: "not_found" });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
