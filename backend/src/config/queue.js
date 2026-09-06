const Queue = require('bull');
const { loadEnv } = require('./env');

const queues = {};

/**
 * Get or create a named Bull queue
 * @param {string} name 
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
        removeOnComplete: 100,
        removeOnFail: 200,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    queues[name].on('error', (err) => {
      console.error(`Queue "${name}" error:`, err.message);
    });

    queues[name].on('failed', (job, err) => {
      console.error(`Job ${job.id} in "${name}" failed:`, err.message);
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
    console.log(`Queue "${name}" closed`);
  });
  await Promise.all(closePromises);
}

module.exports = { getQueue, closeAllQueues };
