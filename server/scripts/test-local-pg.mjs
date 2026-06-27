import pg from 'pg';
const { Pool } = pg;

async function main() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
  });
  
  try {
    const r = await pool.query('SELECT version()');
    console.log('✅ PostgreSQL CONNECTED!');
    console.log('Version:', r.rows[0].version);
    
    // Cek apakah database panenku sudah ada
    const dbs = await pool.query("SELECT datname FROM pg_database WHERE datname = 'panenku'");
    if (dbs.rows.length === 0) {
      console.log('⚠️  Database "panenku" belum ada. Membuat...');
      await pool.query('CREATE DATABASE panenku');
      console.log('✅ Database "panenku" created!');
    } else {
      console.log('✅ Database "panenku" sudah ada');
    }
    
    await pool.end();
    process.exit(0);
  } catch (e) {
    console.error('❌ FAILED:', e.message);
    process.exit(1);
  }
}

main();