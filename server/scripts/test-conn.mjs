import pg from 'pg';
const { Pool } = pg;

const conn = 'postgresql://neondb_owner:npg_QYNJwHrX8z6u@ep-lingering-meadow-atprlkwr.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require';

console.log('Connecting...');

const pool = new Pool({ 
  connectionString: conn,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});

try {
  const r = await pool.query('SELECT version()');
  console.log('SUCCESS:', r.rows[0].version);
  await pool.end();
} catch(e) {
  console.log('FAILED:', e.message);
  await pool.end();
}