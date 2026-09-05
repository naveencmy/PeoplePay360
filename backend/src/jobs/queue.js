const PgBoss = require('pg-boss');
const { loadEnv } = require('../config/env');

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C: BACKGROUND JOB QUEUE (pg-boss — PostgreSQL-backed)
// Production-grade job queue built on PostgreSQL's SELECT ... FOR UPDATE SKIP LOCKED
// Zero additional infrastructure. ACID guarantees. Built-in retry, scheduling, DLQ.
// ─────────────────────────────────────────────────────────────────────────────

const env = loadEnv();

const connectionString = env.DATABASE_URL || 
  `postgresql://${env.DB_USER}:${encodeURIComponent(env.DB_PASSWORD)}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}${env.DB_SSL ? '?sslmode=require' : ''}`;

const boss = new PgBoss({
  connectionString,
  // Retry: 3 attempts, exponential backoff starting at 30s
  retryLimit: 3,
  retryDelay: 30,
  retryBackoff: true,
  // Job expires if not completed in 60 minutes (crash recovery)
  expireInMinutes: 60,
  // Archive completed jobs for 7 days
  retentionDays: 7,
  // Poll interval: 2 seconds (balance latency vs DB load)
  pollInterval: 2000,
});

boss.on('error', (err) => {
  console.error('❌ pg-boss error:', err.message);
});

let isStarted = false;

async function startQueue() {
  if (!isStarted) {
    try {
      await boss.start();
      isStarted = true;
      console.log('⚡ pg-boss background queue started (PostgreSQL-backed)');
    } catch (error) {
      console.warn('⚠️ pg-boss failed to connect to PostgreSQL (will retry or run in offline/test mode):', error.message);
    }
  }
  return boss;
}

async function stopQueue() {
  if (isStarted) {
    try {
      await boss.stop({ graceful: true, timeout: 5000 });
      isStarted = false;
      console.log('⚡ pg-boss background queue stopped');
    } catch (error) {
      console.error('❌ Error stopping pg-boss:', error.message);
    }
  }
}

module.exports = boss;
module.exports.boss = boss;
module.exports.startQueue = startQueue;
module.exports.stopQueue = stopQueue;
