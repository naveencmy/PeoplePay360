const { query } = require('../config/database');

// ─────────────────────────────────────────────────────────────────────────────
// C.7 OBSERVABILITY (SQL Queries against pgboss.job)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Queue depth grouped by status
 */
async function getQueueDepth() {
  const sql = `
    SELECT name, state, COUNT(*)::int as count 
    FROM pgboss.job 
    GROUP BY name, state
    ORDER BY name, state;
  `;
  try {
    const result = await query(sql);
    return result.rows;
  } catch (err) {
    console.warn('⚠️ pgboss.job table not yet initialized or query failed:', err.message);
    return [];
  }
}

/**
 * Oldest unprocessed job waiting in queue
 */
async function getOldestUnprocessedJob() {
  const sql = `
    SELECT name, created_on, data 
    FROM pgboss.job 
    WHERE state = 'created' 
    ORDER BY created_on ASC 
    LIMIT 1;
  `;
  try {
    const result = await query(sql);
    return result.rows[0] || null;
  } catch (err) {
    return null;
  }
}

/**
 * Failed jobs (dead letter inspection)
 */
async function getFailedJobs() {
  const sql = `
    SELECT id, name, data, retrycount, completed_on, output 
    FROM pgboss.job 
    WHERE state = 'failed'
    ORDER BY completed_on DESC
    LIMIT 50;
  `;
  try {
    const result = await query(sql);
    return result.rows;
  } catch (err) {
    return [];
  }
}

/**
 * Worker performance (last 24 hours success vs failed + avg duration)
 */
async function getWorkerPerformance() {
  const sql = `
    SELECT name, 
           COUNT(*) FILTER (WHERE state = 'completed')::int as success,
           COUNT(*) FILTER (WHERE state = 'failed')::int as failed,
           ROUND(COALESCE(AVG(EXTRACT(EPOCH FROM (completed_on - created_on))), 0)::numeric, 2) as avg_duration_sec
    FROM pgboss.job 
    WHERE created_on > now() - interval '24 hours'
    GROUP BY name;
  `;
  try {
    const result = await query(sql);
    return result.rows;
  } catch (err) {
    return [];
  }
}

module.exports = {
  getQueueDepth,
  getOldestUnprocessedJob,
  getFailedJobs,
  getWorkerPerformance,
};
