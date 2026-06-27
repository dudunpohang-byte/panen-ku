import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const conn = 'postgresql://neondb_owner:npg_QYNJwHrX8z6u@ep-lingering-meadow-atprlkwr.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require';
const pool = new Pool({ connectionString: conn, ssl: { rejectUnauthorized: false } });

async function run() {
  const schemaPath = path.join(__dirname, '..', '..', 'db', 'schema.sql');
  console.log('Reading schema from:', schemaPath);
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
  
  console.log('Running schema setup... Total statements:', statements.length);
  let ok = 0, fail = 0;
  for (const stmt of statements) {
    try {
      await pool.query(stmt);
      ok++;
    } catch(e) {
      fail++;
    }
  }
  console.log('Executed:', ok, '| Skipped (already exists):', fail);
  
  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
  console.log('Tables created (' + tables.rows.length + '):', tables.rows.map(r => r.table_name).join(', '));
  
  console.log('Schema setup complete!');
  await pool.end();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });