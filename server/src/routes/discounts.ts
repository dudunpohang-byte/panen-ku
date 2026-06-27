import express from "express";
import { query } from "../db-pool";

const router = express.Router();

// GET /api/discounts?product_id=&active_only=true
router.get("/", async (req, res) => {
  try {
    let sql = `
      SELECT pd.*, p.name as product_name, p.price as product_price, p.farmer_id,
             u.name as created_by_name
      FROM product_discounts pd
      JOIN products p ON p.id = pd.product_id
      JOIN users u ON u.id = pd.created_by
      WHERE 1=1
    `;
    const params: any[] = [];
    let idx = 1;

    if (req.query.product_id) {
      sql += ` AND pd.product_id = $${idx}`;
      params.push(req.query.product_id);
      idx++;
    }
    if (req.query.farmer_id) {
      sql += ` AND p.farmer_id = $${idx}`;
      params.push(req.query.farmer_id);
      idx++;
    }
    if (req.query.active_only === "true") {
      sql += ` AND pd.active = true AND pd.start_date <= CURRENT_DATE AND (pd.end_date IS NULL OR pd.end_date >= CURRENT_DATE)`;
    }

    sql += " ORDER BY pd.created_at DESC";
    const r = await query(sql, params);
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// GET /api/discounts/products/:farmerId - Get all products WITH their discount status
router.get("/products/:farmerId", async (req, res) => {
  try {
    const { farmerId } = req.params;
    const r = await query(
      `SELECT p.*, 
        json_agg(
          json_build_object(
            'id', pd.id,
            'discount_type', pd.discount_type,
            'discount_percent', pd.discount_percent,
            'active', pd.active,
            'start_date', pd.start_date,
            'end_date', pd.end_date,
            'created_by', pd.created_by
          )
        ) FILTER (WHERE pd.id IS NOT NULL) as discounts
      FROM products p
      LEFT JOIN product_discounts pd ON pd.product_id = p.id AND pd.active = true AND pd.start_date <= CURRENT_DATE AND (pd.end_date IS NULL OR pd.end_date >= CURRENT_DATE)
      WHERE p.farmer_id = $1
      GROUP BY p.id
      ORDER BY p.name`,
      [farmerId],
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// POST /api/discounts - Create or update discount
router.post("/", async (req, res) => {
  const { product_id, discount_type, discount_percent, created_by, start_date, end_date } = req.body;

  if (!product_id || !discount_type || discount_percent === undefined || !created_by) {
    return res.status(400).json({ error: "Missing required fields: product_id, discount_type, discount_percent, created_by" });
  }

  if (discount_percent < 0 || discount_percent > 100) {
    return res.status(400).json({ error: "discount_percent must be between 0 and 100" });
  }

  if (!["admin", "farmer"].includes(discount_type)) {
    return res.status(400).json({ error: "discount_type must be 'admin' or 'farmer'" });
  }

  try {
    // Cek apakah produk milik farmer yang sesuai
    const prod = await query("SELECT id, farmer_id FROM products WHERE id = $1", [product_id]);
    if (prod.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Upsert: insert or update if exists
    const r = await query(
      `INSERT INTO product_discounts (product_id, discount_type, discount_percent, created_by, start_date, end_date, active)
       VALUES ($1, $2, $3, $4, 
         COALESCE($5::date, CURRENT_DATE), 
         $6::date, 
         true)
       ON CONFLICT (product_id, discount_type) 
       DO UPDATE SET 
         discount_percent = EXCLUDED.discount_percent,
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date,
         active = true,
         updated_at = now()
       RETURNING *`,
      [product_id, discount_type, discount_percent, created_by, start_date || null, end_date || null],
    );

    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// PATCH /api/discounts/:id - Toggle active status
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  try {
    const r = await query(
      "UPDATE product_discounts SET active = $1, updated_at = now() WHERE id = $2 RETURNING *",
      [active !== false, id],
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "not_found" });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/discounts/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const r = await query("DELETE FROM product_discounts WHERE id = $1 RETURNING id", [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: "not_found" });
    res.json({ deleted: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;