const fs = require('fs');
const path = require('path');
const { getPool, closePool } = require('../config/database');

async function runMigration() {
  const pool = getPool();
  const sqlPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Running database schema migration...');
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('Schema migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await closePool();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
