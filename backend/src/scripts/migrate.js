const fs = require('fs');
const path = require('path');
const { getPool, closePool } = require('../config/database');

// ─────────────────────────────────────────────────────────────────────────────
// Zero-Downtime Transaction-Safe Migration Runner
// Supports: up, down, status, schema_migrations table tracking
// ─────────────────────────────────────────────────────────────────────────────

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

/**
 * Ensure the schema_migrations tracking table exists
 */
async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
}

/**
 * Get list of already applied migrations
 */
async function getAppliedMigrations(client) {
  const result = await client.query(
    'SELECT name, applied_at FROM schema_migrations ORDER BY id ASC'
  );
  return result.rows;
}

/**
 * Get all available migration files sorted
 */
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql') && !file.endsWith('_down.sql'))
    .sort();
}

/**
 * Run all pending migrations (UP)
 */
async function runMigrationsUp() {
  const pool = getPool();
  const client = await pool.connect();

  console.log('🚀 Starting database migrations (UP)...');
  try {
    await ensureMigrationsTable(client);
    const applied = (await getAppliedMigrations(client)).map((m) => m.name);
    const files = getMigrationFiles();

    const pending = files.filter((f) => !applied.includes(f));

    if (pending.length === 0) {
      console.log('✅ Database is already up to date. No pending migrations.');
      return;
    }

    console.log(`📦 Found ${pending.length} pending migration(s): ${pending.join(', ')}`);

    for (const file of pending) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      const start = Date.now();

      console.log(`⏳ Applying migration: ${file}...`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`✅ Applied ${file} (${Date.now() - start}ms)`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Migration failed: ${file}. Transaction rolled back.`);
        throw err;
      }
    }

    console.log('🎉 All pending migrations applied successfully!');
  } finally {
    client.release();
  }
}

/**
 * Roll back the most recent migration (DOWN)
 */
async function runMigrationsDown() {
  const pool = getPool();
  const client = await pool.connect();

  console.log('⏪ Rolling back most recent migration (DOWN)...');
  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);

    if (applied.length === 0) {
      console.log('⚠️ No applied migrations to roll back.');
      return;
    }

    const lastMigration = applied[applied.length - 1].name;
    const baseName = lastMigration.replace('.sql', '');
    const downFile = `${baseName}_down.sql`;
    const downFilePath = path.join(MIGRATIONS_DIR, downFile);

    if (!fs.existsSync(downFilePath)) {
      throw new Error(`Rollback script ${downFile} not found for ${lastMigration}`);
    }

    const sql = fs.readFileSync(downFilePath, 'utf8');
    const start = Date.now();

    console.log(`⏳ Rolling back: ${lastMigration} using ${downFile}...`);
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('DELETE FROM schema_migrations WHERE name = $1', [lastMigration]);
      await client.query('COMMIT');
      console.log(`✅ Rolled back ${lastMigration} (${Date.now() - start}ms)`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`❌ Rollback failed for ${lastMigration}. Transaction reverted.`);
      throw err;
    }
  } finally {
    client.release();
  }
}

/**
 * Print migration status
 */
async function printStatus() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);
    const appliedRows = await getAppliedMigrations(client);
    const appliedMap = new Map(appliedRows.map((r) => [r.name, r.applied_at]));
    const files = getMigrationFiles();

    console.log('\n📊 Database Migration Status:');
    console.log('─────────────────────────────────────────────────────────────');
    for (const file of files) {
      if (appliedMap.has(file)) {
        console.log(` ✅ [APPLIED]  ${file} (${appliedMap.get(file).toISOString()})`);
      } else {
        console.log(` ⏳ [PENDING]  ${file}`);
      }
    }
    console.log('─────────────────────────────────────────────────────────────\n');
  } finally {
    client.release();
  }
}

async function runMigration() {
  const command = process.argv[2] || 'up';

  try {
    if (command === 'down') {
      await runMigrationsDown();
    } else if (command === 'status') {
      await printStatus();
    } else {
      await runMigrationsUp();
    }
  } catch (error) {
    console.error('Migration runner error:', error.message);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  } finally {
    if (require.main === module) {
      await closePool();
    }
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  runMigrationsUp,
  runMigrationsDown,
  printStatus,
};
