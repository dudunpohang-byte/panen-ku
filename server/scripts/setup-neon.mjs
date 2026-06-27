import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setup() {
  console.log('Connecting to Neon cloud PostgreSQL...');
  
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL.replace('?sslmode=require', ''), 
    ssl: true,
    max: 1
  });
  
  // Test connection
  const test = await pool.query('SELECT version()');
  console.log('✓ Connected:', test.rows[0].version.substring(0, 80));
  
  const schemaPath = path.join(__dirname, '..', '..', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
  
  let ok = 0, skip = 0, errors = [];
  for (const stmt of statements) {
    try {
      await pool.query(stmt);
      ok++;
    } catch (err) {
      skip++;
      if (skip < 5) errors.push(err.message.substring(0, 80));
    }
  }
  
  console.log(`✓ Schema: ${ok} statements executed, ${skip} skipped`);
  if (errors.length > 0) console.log('  (First few skips:', errors.join('; '), ')');
  
  // Verify tables
  const tables = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name"
  );
  console.log(`✓ Tables created (${tables.rows.length}):`, tables.rows.map(r => r.table_name).join(', '));
  
  // Verify enums
  const types = await pool.query(
    "SELECT t.typname FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid GROUP BY t.typname"
  );
  console.log(`✓ Enums:`, types.rows.map(r => r.typname).join(', '));
  
  await pool.end();
  console.log('✓ Setup complete!');
}

setup().catch(err => {
  console.error('✗ FAILED:', err.message);
  console.error(err.stack);
  process.exit(1);
});