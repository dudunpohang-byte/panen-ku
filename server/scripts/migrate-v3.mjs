import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const conn = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/panenku';
const pool = new Pool({ connectionString: conn });

async function run() {
  const sqlPath = path.join(__dirname, '..', '..', 'db', 'migration_v3.sql');
  console.log('Reading migration from:', sqlPath);
  
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
  
  console.log(`Running ${statements.length} statements...`);
  let ok = 0, fail = 0;
  for (const stmt of statements) {
    try {
      await pool.query(stmt);
      ok++;
    } catch(e) {
      console.error(`  ✗ Error: ${e.message.substring(0, 120)}`);
      fail++;
    }
  }
  console.log(`\nExecuted: ${ok} | Failed: ${fail}`);
  
  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
  console.log('\nTables (' + tables.rows.length + '):');
  console.log(tables.rows.map(r => '  - ' + r.table_name).join('\n'));
  
  await pool.end();
  console.log('\nMigration v3 complete!');
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });