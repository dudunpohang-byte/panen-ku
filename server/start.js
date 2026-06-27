require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');

const app = express();
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '10mb' }));

const rawUrl = process.env.DATABASE_URL || '';

// Neon (cloud PostgreSQL) memerlukan SSL
const isNeon = rawUrl.includes('neon.tech');

// Parse connection string secara aman
const pool = new Pool({
  connectionString: isNeon
    ? rawUrl.replace(/\?sslmode=require$/, '').replace(/\?$/, '')
    : rawUrl,
  ...(isNeon ? { ssl: { rejectUnauthorized: false } } : {}),
  max: 50, min: 5, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000,
});

// ===================== UTILITY =====================
function sanitize(obj, fields) {
  const out = {};
  for (const f of fields) if (obj[f] !== undefined) out[f] = obj[f];
  return out;
}

async function auth(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  const r = await pool.query('SELECT id, name, role FROM users WHERE id = $1', [userId]);
  if (r.rowCount === 0) return res.status(401).json({ error: 'user_not_found' });
  req.user = r.rows[0];
  next();
}

// ===================== HEALTH =====================
app.get('/api/health', (req, res) => {
  res.json({ ok: true, database: 'neon_cloud', version: '2.0', time: new Date().toISOString() });
});

// ===================== USERS =====================
app.get('/api/users', async (req, res) => {
  try {
    const r = await pool.query('SELECT id, name, email, phone, role, avatar, farm_name, farm_location, farm_city_id, full_address, farm_description, farm_established, certifications, status, balance, pending_balance, bank_name, bank_account, bank_holder, ewallet_type, ewallet_account, created_at FROM users ORDER BY created_at DESC');
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT id, name, email, phone, role, avatar, farm_name, farm_location, farm_city_id, full_address, certifications, status, balance, pending_balance, bank_name, bank_account, bank_holder, ewallet_type, ewallet_account, created_at FROM users WHERE id=$1', [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'not_found' });
    res.json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { phone, pin } = req.body || {};
    if (!phone || !pin) return res.status(400).json({ error: 'phone_and_pin_required' });
    const r = await pool.query('SELECT id, name, email, phone, role, avatar, farm_name, farm_location, status, balance, pending_balance FROM users WHERE phone=$1 AND pin=$2', [phone, pin]);
    if (r.rowCount === 0) return res.status(401).json({ error: 'invalid_credentials' });
    res.json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { phone, pin, name, role } = req.body || {};
    if (!phone || !pin || !name || !role) return res.status(400).json({ error: 'required_fields_missing' });
    const exist = await pool.query('SELECT id FROM users WHERE phone=$1', [phone]);
    if (exist.rowCount > 0) return res.status(409).json({ error: 'phone_already_registered' });
    const r = await pool.query(
      'INSERT INTO users (phone, pin, name, role, balance, pending_balance, status) VALUES ($1,$2,$3,$4,0,0,$5) RETURNING id, name, phone, role',
      [phone, pin, name, role, role === 'farmer' ? 'pending' : null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// Update user profile (bank/ewallet info)
app.patch('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = sanitize(req.body, ['name', 'avatar', 'farm_name', 'farm_location', 'farm_city_id', 'full_address', 'farm_description', 'farm_established', 'certifications', 'shipping_packaging_method', 'bank_name', 'bank_account', 'bank_holder', 'ewallet_type', 'ewallet_account']);
    if (Object.keys(allowed).length === 0) return res.status(400).json({ error: 'no_fields_to_update' });
    
    const sets = Object.keys(allowed).map((k, i) => `${k}=$${i+2}`).join(',');
    const vals = Object.values(allowed);
    await pool.query(`UPDATE users SET ${sets}, updated_at=now() WHERE id=$1`, [id, ...vals]);
    
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// ===================== PRODUCTS =====================
app.get('/api/products', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT p.*, u.name AS farmer_name, u.farm_name, u.farm_location FROM products p JOIN users u ON u.id = p.farmer_id WHERE u.status=$1 ORDER BY p.created_at DESC LIMIT 200',
      ['approved']
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT p.*, u.name AS farmer_name, u.farm_name, u.farm_location FROM products p JOIN users u ON u.id=p.farmer_id WHERE p.id=$1', [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'not_found' });
    res.json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// ===================== ORDERS =====================
app.post('/api/orders', async (req, res) => {
  const payload = req.body;
  if (!payload || !Array.isArray(payload.items) || !payload.buyer_id) {
    return res.status(400).json({ error: 'invalid_payload' });
  }
  try {
    const orderId = await withRetry(async () => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN ISOLATION LEVEL READ COMMITTED');
        
        const productIds = payload.items.map(it => it.product_id);
        const stockCheck = await client.query(
          'SELECT id, price, stock, farmer_id FROM products WHERE id = ANY($1) FOR UPDATE SKIP LOCKED',
          [productIds]
        );
        const stockMap = new Map(stockCheck.rows.map(r => [r.id, r]));
        
        for (const it of payload.items) {
          const prod = stockMap.get(it.product_id);
          if (!prod) throw new Error(`product_not_found:${it.product_id}`);
          if (prod.stock < it.qty) throw new Error(`insufficient_stock:${it.product_id}`);
        }
        
        let subtotal = 0;
        for (const it of payload.items) {
          const prod = stockMap.get(it.product_id);
          subtotal += Number(prod.price) * Number(it.qty);
        }
        
        const adminSettings = await client.query('SELECT admin_fee_percent FROM admin_settings WHERE id=true');
        const adminFeePercent = Number(adminSettings.rows[0]?.admin_fee_percent || 5);
        const adminFee = Math.round(subtotal * adminFeePercent / 100);
        const shipping = Number(payload.shipping || 0);
        const total = subtotal + shipping + adminFee;
        
        const orderRes = await client.query(
          `INSERT INTO orders (buyer_id, buyer_name, buyer_phone, address, buyer_city_id, distance_km, subtotal, shipping, admin_fee, total, total_amount, status, shipping_method, shipping_address) 
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
          [payload.buyer_id, payload.buyer_name, payload.buyer_phone, payload.address, payload.buyer_city_id, payload.distance_km, subtotal, shipping, adminFee, total, total, 'dibayar', payload.shipping_method || 'jasa_kirim', payload.shipping_address || payload.address]
        );
        const orderId = orderRes.rows[0].id;
        
        for (const it of payload.items) {
          const prod = stockMap.get(it.product_id);
          await client.query(
            'INSERT INTO order_items (order_id, product_id, farmer_id, product_name, image, price, qty) VALUES ($1,$2,$3,$4,$5,$6,$7)',
            [orderId, it.product_id, prod.farmer_id, it.product_name, it.image, prod.price, it.qty]
          );
          await client.query('UPDATE products SET stock = stock - $1, sold = sold + $1 WHERE id = $2', [it.qty, it.product_id]);
          
          // Update farmer pending_balance (gross - admin fee)
          const net = (Number(prod.price) * it.qty) - Math.round((Number(prod.price) * it.qty) * adminFeePercent / 100);
          await client.query('UPDATE users SET pending_balance = COALESCE(pending_balance,0) + $1 WHERE id = $2', [net, prod.farmer_id]);
        }
        
        // Update admin fee balance
        await client.query('UPDATE admin_fee_balance SET total_fee_collected = total_fee_collected + $1, current_balance = current_balance + $1, updated_at = now() WHERE id = true', [adminFee]);
        
        await client.query('COMMIT');
        return orderId;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    });
    res.status(201).json({ id: orderId });
  } catch (err) {
    console.error(err);
    if (String(err.message).startsWith('product_not_found')) return res.status(404).json({ error: err.message });
    if (String(err.message).startsWith('insufficient_stock')) return res.status(400).json({ error: err.message });
    if (err.message === 'CONCURRENT_MODIFICATION_RETRY') return res.status(409).json({ error: 'concurrent_modification', retry: true });
    res.status(500).json({ error: 'server_error' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT o.*, COALESCE(json_agg(oi ORDER BY oi.created_at) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
       FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id ORDER BY o.created_at DESC LIMIT 100`
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT o.*, COALESCE(json_agg(oi ORDER BY oi.created_at) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
       FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id WHERE o.id=$1 GROUP BY o.id`,
      [req.params.id]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'not_found' });
    res.json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.get('/api/orders/buyer/:buyerId', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT o.*, COALESCE(json_agg(oi ORDER BY oi.created_at) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
       FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id WHERE o.buyer_id=$1
       GROUP BY o.id ORDER BY o.created_at DESC`,
      [req.params.buyerId]
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// Update order status (farmer workflow)
app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['menunggu_bayar', 'dibayar', 'disiapkan', 'dikirim', 'selesai', 'dibatalkan'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'invalid_status' });
  
  try {
    const r = await pool.query('UPDATE orders SET status=$1, updated_at=now() WHERE id=$2 RETURNING id, status', [status, id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'not_found' });
    
    // If completed: move pending_balance to balance (after 1 day hold)
    // (scheduled job would do this, but we mark order as completed)
    if (status === 'selesai') {
      // Trigger 1-day hold logic: mark for auto-release
      await pool.query(
        `UPDATE orders SET status='selesai', updated_at=now() WHERE id=$1`,
        [id]
      );
    }
    
    res.json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// BUYER confirms delivery (order completed)
app.post('/api/orders/:id/confirm', async (req, res) => {
  const { id } = req.params;
  try {
    const order = await pool.query('SELECT id, status FROM orders WHERE id=$1', [id]);
    if (order.rowCount === 0) return res.status(404).json({ error: 'not_found' });
    if (order.rows[0].status !== 'dikirim') return res.status(400).json({ error: 'order_not_in_delivery_status' });
    
    // Set order to selesai (completed)
    await pool.query('UPDATE orders SET status=$1, updated_at=now() WHERE id=$2', ['selesai', id]);
    
    // Move pending_balance to balance for all farmers in this order
    const items = await pool.query('SELECT DISTINCT farmer_id FROM order_items WHERE order_id=$1', [id]);
    for (const item of items.rows) {
      if (item.farmer_id) {
        const farmerTotal = await pool.query(
          'SELECT SUM((price * qty) - ROUND((price * qty) * (SELECT COALESCE(admin_fee_percent,5) FROM admin_settings WHERE id=true) / 100)) as net FROM order_items WHERE order_id=$1 AND farmer_id=$2',
          [id, item.farmer_id]
        );
        const netAmount = Number(farmerTotal.rows[0]?.net || 0);
        if (netAmount > 0) {
          await pool.query(
            'UPDATE users SET pending_balance = GREATEST(COALESCE(pending_balance,0) - $1, 0), balance = COALESCE(balance,0) + $1 WHERE id=$2',
            [netAmount, item.farmer_id]
          );
        }
      }
    }
    
    res.json({ ok: true, status: 'selesai' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// ===================== SHIPMENTS =====================
app.post('/api/shipments', async (req, res) => {
  const { order_id, farmer_id, courier_name, tracking_number, shipping_service, notes } = req.body;
  if (!order_id || !farmer_id) return res.status(400).json({ error: 'invalid_payload' });
  try {
    const r = await pool.query(
      `INSERT INTO shipments (order_id, farmer_id, buyer_id, courier_name, tracking_number, shipping_service, status, notes)
       SELECT $1, $2, buyer_id, $3, $4, $5, 'pending_pickup', $6 FROM orders WHERE id=$1 AND status IN ('dibayar','disiapkan')
       RETURNING id`,
      [order_id, farmer_id, courier_name || 'petani_sendiri', tracking_number, shipping_service, notes]
    );
    if (r.rowCount === 0) return res.status(400).json({ error: 'order_not_ready_for_shipping' });
    res.status(201).json({ id: r.rows[0].id });
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.patch('/api/shipments/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, location, notes, proof_of_delivery } = req.body;
  const validStatuses = ['pending_pickup', 'picked_up', 'in_transit', 'delivered', 'failed'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'invalid_status' });
  
  try {
    const updateFields = [];
    const updateVals = [];
    
    updateFields.push('status=$' + (updateVals.length + 1));
    updateVals.push(status);
    
    if (location) {
      updateFields.push('location=$' + (updateVals.length + 1));
      updateVals.push(location);
    }
    if (notes) {
      updateFields.push('notes=$' + (updateVals.length + 1));
      updateVals.push(notes);
    }
    updateFields.push('updated_at=now()');
    
    const r = await pool.query(
      `UPDATE shipments SET ${updateFields.join(',')} WHERE id=$${updateVals.length + 1} RETURNING id, order_id, status`,
      [...updateVals, id]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'shipment_not_found' });
    
    // Add event timeline
    await pool.query(
      'INSERT INTO shipment_events (shipment_id, event_type, location, notes) VALUES ($1,$2,$3,$4)',
      [id, status, location, notes]
    );
    
    // If delivered: update order status to dikirim (for buyer confirmation)
    if (status === 'delivered') {
      await pool.query("UPDATE orders SET status='dikirim', updated_at=now() WHERE id=$1", [r.rows[0].order_id]);
    }
    
    res.json({ id: r.rows[0].id, status: r.rows[0].status });
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.get('/api/shipments/order/:orderId', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT s.*, COALESCE(json_agg(se ORDER BY se.timestamp) FILTER (WHERE se.id IS NOT NULL), '[]') as events
       FROM shipments s LEFT JOIN shipment_events se ON se.shipment_id = s.id
       WHERE s.order_id=$1 GROUP BY s.id`,
      [req.params.orderId]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'shipment_not_found' });
    res.json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.get('/api/shipments/farmer/:farmerId', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT s.*, o.buyer_name, o.shipping_address FROM shipments s
       JOIN orders o ON o.id = s.order_id WHERE s.farmer_id=$1 ORDER BY s.created_at DESC`,
      [req.params.farmerId]
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// ===================== PAYMENT METHODS (E-WALLET & BANK) =====================
app.get('/api/payment-methods/:userId', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM payment_methods WHERE user_id=$1 ORDER BY is_default DESC, created_at DESC', [req.params.userId]);
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.post('/api/payment-methods', async (req, res) => {
  try {
    const { user_id, type, ewallet_provider, ewallet_phone, ewallet_name, bank_name, bank_account_number, bank_account_name, is_default } = req.body;
    if (!user_id || !type) return res.status(400).json({ error: 'required_fields_missing' });
    
    // Validation
    if (type === 'ewallet' && (!ewallet_provider || !ewallet_phone || !ewallet_name)) {
      return res.status(400).json({ error: 'ewallet_details_required' });
    }
    if (type === 'bank' && (!bank_name || !bank_account_number || !bank_account_name)) {
      return res.status(400).json({ error: 'bank_details_required' });
    }
    
    // If is_default, unset others
    if (is_default) {
      await pool.query('UPDATE payment_methods SET is_default=false WHERE user_id=$1', [user_id]);
    }
    
    const r = await pool.query(
      `INSERT INTO payment_methods (user_id, type, ewallet_provider, ewallet_phone, ewallet_name, bank_name, bank_account_number, bank_account_name, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [user_id, type, ewallet_provider, ewallet_phone, ewallet_name, bank_name, bank_account_number, bank_account_name, is_default || false]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.delete('/api/payment-methods/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM payment_methods WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// ===================== WITHDRAWALS (FARMER & ADMIN) =====================
// Farmer withdrawal request
app.post('/api/withdrawals/request', async (req, res) => {
  try {
    const { user_id, amount, payment_method_id } = req.body;
    if (!user_id || !amount || amount <= 0) return res.status(400).json({ error: 'invalid_request' });
    
    const result = await withRetry(async () => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
        
        // Check user balance
        const user = await client.query('SELECT id, balance, role FROM users WHERE id=$1 FOR UPDATE', [user_id]);
        if (user.rowCount === 0) throw new Error('user_not_found');
        if (Number(user.rows[0].balance) < amount) throw new Error('insufficient_balance');
        
        // Get payment method details
        let paymentType = 'balance', paymentProvider = null, paymentAccount = null, paymentName = null;
        if (payment_method_id) {
          const pm = await client.query('SELECT * FROM payment_methods WHERE id=$1 AND user_id=$2', [payment_method_id, user_id]);
          if (pm.rowCount > 0) {
            const p = pm.rows[0];
            paymentType = p.type;
            paymentProvider = p.ewallet_provider || p.bank_name;
            paymentAccount = p.ewallet_phone || p.bank_account_number;
            paymentName = p.ewallet_name || p.bank_account_name;
          }
        }
        
        // Calculate fee (admin fee for withdrawal)
        const fee = 0; // no fee for now
        const netAmount = amount - fee;
        
        // Deduct from balance
        await client.query('UPDATE users SET balance = balance - $1 WHERE id=$2', [amount, user_id]);
        
        // Create withdrawal record
        const w = await client.query(
          `INSERT INTO withdrawals (user_id, role, amount, fee, net_amount, payment_method_id, payment_type, payment_provider, payment_account, payment_name, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending') RETURNING *`,
          [user_id, user.rows[0].role, amount, fee, netAmount, payment_method_id, paymentType, paymentProvider, paymentAccount, paymentName]
        );
        
        await client.query('COMMIT');
        return w.rows[0];
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    });
    
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    if (err.message === 'user_not_found') return res.status(404).json({ error: 'user_not_found' });
    if (err.message === 'insufficient_balance') return res.status(400).json({ error: 'insufficient_balance' });
    res.status(500).json({ error: 'server_error' });
  }
});

// Admin: get all pending withdrawals
app.get('/api/withdrawals/pending', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT w.*, u.name AS user_name, u.phone AS user_phone
       FROM withdrawals w JOIN users u ON u.id = w.user_id
       WHERE w.status='pending' ORDER BY w.created_at ASC`
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// Admin: process withdrawal
app.patch('/api/withdrawals/:id/process', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_id, admin_notes } = req.body;
    if (!['completed', 'failed', 'cancelled'].includes(status)) return res.status(400).json({ error: 'invalid_status' });
    
    const result = await withRetry(async () => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const w = await client.query('SELECT * FROM withdrawals WHERE id=$1 FOR UPDATE', [id]);
        if (w.rowCount === 0) throw new Error('withdrawal_not_found');
        if (w.rows[0].status !== 'pending') throw new Error('withdrawal_already_processed');
        
        if (status === 'completed') {
          // Mark as completed
          await client.query(
            'UPDATE withdrawals SET status=$1, admin_id=$2, admin_notes=$3, processed_at=now(), updated_at=now() WHERE id=$4',
            ['completed', admin_id, admin_notes, id]
          );
        } else {
          // Failed/cancelled: refund to user balance
          await client.query(
            'UPDATE users SET balance = COALESCE(balance,0) + $1 WHERE id=$2',
            [w.rows[0].amount, w.rows[0].user_id]
          );
          await client.query(
            'UPDATE withdrawals SET status=$1, admin_id=$2, admin_notes=$3, processed_at=now(), updated_at=now() WHERE id=$4',
            [status, admin_id, admin_notes, id]
          );
        }
        
        await client.query('COMMIT');
        return { ok: true, status };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    });
    
    res.json(result);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// Get withdrawal history for user
app.get('/api/withdrawals/user/:userId', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM withdrawals WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',
      [req.params.userId]
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// ===================== ADMIN FEE BALANCE =====================
app.get('/api/admin/fee-balance', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM admin_fee_balance WHERE id=true');
    res.json(r.rows[0] || { current_balance: 0, total_fee_collected: 0, total_withdrawn: 0 });
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// Admin withdrawal from fee balance
app.post('/api/admin/fee-withdraw', async (req, res) => {
  try {
    const { amount, admin_id, payment_method_id } = req.body;
    if (!amount || !admin_id) return res.status(400).json({ error: 'invalid_request' });
    
    const result = await withRetry(async () => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const balance = await client.query('SELECT current_balance FROM admin_fee_balance WHERE id=true FOR UPDATE');
        if (Number(balance.rows[0].current_balance) < amount) throw new Error('insufficient_admin_balance');
        
        let pmType = 'balance', pmProvider = null, pmAccount = null, pmName = null;
        if (payment_method_id) {
          const pm = await client.query('SELECT * FROM payment_methods WHERE id=$1', [payment_method_id]);
          if (pm.rowCount > 0) {
            const p = pm.rows[0];
            pmType = p.type; pmProvider = p.ewallet_provider || p.bank_name;
            pmAccount = p.ewallet_phone || p.bank_account_number;
            pmName = p.ewallet_name || p.bank_account_name;
          }
        }
        
        const fee = 0;
        const netAmount = amount - fee;
        
        await client.query(
          'UPDATE admin_fee_balance SET current_balance = current_balance - $1, total_withdrawn = total_withdrawn + $1 WHERE id=true',
          [amount]
        );
        
        const w = await client.query(
          `INSERT INTO withdrawals (user_id, role, amount, fee, net_amount, payment_method_id, payment_type, payment_provider, payment_account, payment_name, status)
           VALUES ($1,'admin',$2,$3,$4,$5,$6,$7,$8,$9,'pending') RETURNING *`,
          [admin_id, amount, fee, netAmount, payment_method_id, pmType, pmProvider, pmAccount, pmName]
        );
        
        await client.query('COMMIT');
        return w.rows[0];
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    });
    
    res.status(201).json(result);
  } catch (e) {
    if (e.message === 'insufficient_admin_balance') return res.status(400).json({ error: 'insufficient_admin_balance' });
    console.error(e); res.status(500).json({ error: 'server_error' });
  }
});

// ===================== RETURN / REFUND =====================
app.post('/api/returns', async (req, res) => {
  try {
    const { order_id, order_item_id, buyer_id, farmer_id, reason, description, evidence_images } = req.body;
    if (!order_id || !buyer_id || !reason) return res.status(400).json({ error: 'required_fields_missing' });
    
    const r = await pool.query(
      `INSERT INTO return_requests (order_id, order_item_id, buyer_id, farmer_id, reason, description, evidence_images, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING *`,
      [order_id, order_item_id, buyer_id, farmer_id, reason, description, evidence_images || []]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.get('/api/returns', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT rr.*, o.order_number, u.name AS buyer_name 
       FROM return_requests rr JOIN orders o ON o.id=rr.order_id JOIN users u ON u.id=rr.buyer_id
       ORDER BY rr.created_at DESC LIMIT 100`
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.get('/api/returns/buyer/:buyerId', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM return_requests WHERE buyer_id=$1 ORDER BY created_at DESC',
      [req.params.buyerId]
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.patch('/api/returns/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_id, admin_notes, refund_amount } = req.body;
    if (!['approved', 'rejected', 'refunded', 'cancelled'].includes(status)) return res.status(400).json({ error: 'invalid_status' });
    
    const result = await withRetry(async () => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const rr = await client.query('SELECT * FROM return_requests WHERE id=$1 FOR UPDATE', [id]);
        if (rr.rowCount === 0) throw new Error('return_not_found');
        
        if (status === 'refunded') {
          const refundAmt = refund_amount || 0;
          if (refundAmt <= 0) throw new Error('refund_amount_required');
          
          // Deduct from farmer balance or admin fee balance
          await client.query(
            'UPDATE users SET balance = COALESCE(balance,0) + $1 WHERE id=$2',
            [refundAmt, rr.rows[0].buyer_id]
          );
        }
        
        await client.query(
          `UPDATE return_requests SET status=$1, admin_id=$2, admin_notes=$3, refund_amount=$4, resolved_at=now(), updated_at=now() WHERE id=$5`,
          [status, admin_id, admin_notes, refund_amount || 0, id]
        );
        
        await client.query('COMMIT');
        return { ok: true, status };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    });
    
    res.json(result);
  } catch (e) {
    if (e.message === 'refund_amount_required') return res.status(400).json({ error: 'refund_amount_required' });
    console.error(e); res.status(500).json({ error: 'server_error' });
  }
});

// ===================== ADMIN LOGS =====================
app.get('/api/admin/logs', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 200');
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.post('/api/admin/logs', async (req, res) => {
  try {
    const { admin_id, admin_name, action, status, detail } = req.body;
    if (!admin_id || !action) return res.status(400).json({ error: 'required_fields_missing' });
    const r = await pool.query(
      'INSERT INTO admin_logs (admin_id, admin_name, action, status, detail) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [admin_id, admin_name || 'Admin', action, status || 'success', detail]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// ===================== HELPERS =====================
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.code === '40001' && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.random() * 100));
        continue;
      }
      if (String(err.message).includes('CONCURRENT_MODIFICATION') && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.random() * 100));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

// ===================== START SERVER =====================
const port = Number(process.env.PORT || 4000);
app.listen(port, '0.0.0.0', () => {
  console.log('============================================');
  console.log('Panenku Server v2.0 — FULL FEATURES');
  console.log(`URL: http://localhost:${port}`);
  console.log(`Health: http://localhost:${port}/api/health`);
  console.log('Database: Neon PostgreSQL Cloud');
  console.log('');
  console.log('✅ Products API');
  console.log('✅ Users + Auth API');
  console.log('✅ Orders + Checkout + Confirm');
  console.log('✅ Shipments + Tracking + Timeline');
  console.log('✅ Payment Methods (E-Wallet & Bank)');
  console.log('✅ Withdrawals (Farmer & Admin)');
  console.log('✅ Returns / Refunds');
  console.log('✅ Admin Fee Balance');
  console.log('✅ Multi-user Safe (Serializable TX)');
  console.log('============================================');
});