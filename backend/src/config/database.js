const { Pool } = require('pg');
const { loadEnv } = require('./env');

// ─────────────────────────────────────────────────────────────────────────────
// PostgreSQL Connection Pool — singleton with env-driven configuration
// ─────────────────────────────────────────────────────────────────────────────

let pool = null;

function getPool() {
  if (!pool) {
    const env = loadEnv();
    pool = new Pool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
      min: env.DB_POOL_MIN,
      max: env.DB_POOL_MAX,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('❌ Unexpected PostgreSQL pool error:', err.message);
    });

    pool.on('connect', () => {
      if (env.NODE_ENV === 'development') {
        console.log('🔌 New PostgreSQL connection established');
      }
    });
  }
  return pool;
}

/**
 * Execute a query with parameterized values
 * @param {string} text - SQL query text with $1, $2, ... placeholders
 * @param {Array} params - Parameter values
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params = []) {
  const start = Date.now();
  const result = await getPool().query(text, params);
  const duration = Date.now() - start;

  if (loadEnv().NODE_ENV === 'development' && duration > 200) {
    console.warn(`⚠️ Slow query (${duration}ms):`, text.substring(0, 100));
  }

  return result;
}

/**
 * Get a client from the pool for transaction support
 * @returns {Promise<import('pg').PoolClient>}
 */
async function getClient() {
  return getPool().connect();
}

/**
 * Execute a function within a database transaction
 * @param {Function} fn - Async function receiving the client
 * @returns {Promise<*>} Result of the function
 */
async function withTransaction(fn) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Gracefully close the pool
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 PostgreSQL pool closed');
  }
}

module.exports = { getPool, query, getClient, withTransaction, closePool };
