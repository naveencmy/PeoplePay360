const Queue = require('bull');
const { loadEnv } = require('./env');

// ─────────────────────────────────────────────────────────────────────────────
// Bull Queue Configuration — Background job processing
// ─────────────────────────────────────────────────────────────────────────────

const queues = {};

/**
 * Get or create a named Bull queue
 * @param {string} name - Queue name (e.g., 'email', 'pdf')
 * @returns {Queue.Queue}
 */
function getQueue(name) {
  if (!queues[name]) {
    const env = loadEnv();
    queues[name] = new Queue(name, {
      redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD || undefined,
        db: env.REDIS_DB,
      },
      defaultJobOptions: {
        removeOnComplete: 100,  // Keep last 100 completed jobs
        removeOnFail: 200,      // Keep last 200 failed jobs
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    queues[name].on('error', (err) => {
      console.error(`❌ Queue "${name}" error:`, err.message);
    });

    queues[name].on('failed', (job, err) => {
      console.error(`❌ Job ${job.id} in "${name}" failed:`, err.message);
    });
  }
  return queues[name];
}

/**
 * Close all queues gracefully
 */
async function closeAllQueues() {
  const closePromises = Object.entries(queues).map(async ([name, queue]) => {
    await queue.close();
    console.log(`📋 Queue "${name}" closed`);
  });
  await Promise.all(closePromises);

  try {
    const { stopJobs } = require('../jobs');
    await stopJobs();
  } catch (_e) {
    // Ignore if not initialized
  }
}

module.exports = { getQueue, closeAllQueues };
