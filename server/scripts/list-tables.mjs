import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: 'postgresql://postgres@localhost:5432/panenku' });

async function main() {
  const r = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
  console.log('Tables in panenku database:');
  console.log(r.rows.map(x => ' - ' + x.table_name).join('\n'));
  console.log(`\nTotal: ${r.rows.length} tables`);
  await pool.end();
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });