require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 50,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, database: 'neon_cloud', time: new Date().toISOString() });
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT p.*, u.name AS farmer_name, u.farm_name, u.farm_location FROM products p JOIN users u ON u.id = p.farmer_id ORDER BY p.created_at DESC LIMIT 200'
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'not_found' });
    res.json(r.rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// Users
app.get('/api/users', async (req, res) => {
  try {
    const r = await pool.query('SELECT id, name, email, role, farm_name, farm_location, avatar FROM users ORDER BY created_at DESC');
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// Orders
app.get('/api/orders', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100');
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

// Shipments
app.get('/api/shipments', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM shipments ORDER BY created_at DESC LIMIT 100');
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'server_error' }); }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, '0.0.0.0', () => {
  console.log('========================================');
  console.log('Panenku Server started!');
  console.log(`Local: http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/api/health`);
  console.log(`Database: Neon Cloud PostgreSQL`);
  console.log('CORS: All origins allowed (public)');
  console.log('========================================');
});