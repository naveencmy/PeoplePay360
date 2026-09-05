const Redis = require('ioredis');
const { loadEnv } = require('./env');

// ─────────────────────────────────────────────────────────────────────────────
// Redis Client — resilient singleton for caching with zero-latency offline bypass
// ─────────────────────────────────────────────────────────────────────────────

let redis = null;
let loggedOfflineWarning = false;

function getRedis() {
  if (!redis) {
    const env = loadEnv();
    redis = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      db: env.REDIS_DB,
      enableOfflineQueue: false, // Do NOT queue commands when disconnected; fail fast
      maxRetriesPerRequest: 1,   // Fail immediately instead of delaying HTTP requests
      connectTimeout: 1000,      // Fast timeout on connection attempts
      retryStrategy(times) {
        // Back off gently if Redis isn't running locally (every 30s)
        return Math.min(times * 5000, 30000);
      },
      lazyConnect: false,
    });

    redis.on('ready', () => {
      loggedOfflineWarning = false;
      console.log('🟢 Redis cache connected & active');
    });

    redis.on('error', (err) => {
      if (!loggedOfflineWarning) {
        console.warn(`⚠️ Redis cache unavailable (${err.code || err.message}). Operating in bypass mode (direct PostgreSQL queries).`);
        loggedOfflineWarning = true;
      }
    });

    redis.on('close', () => {
      // Disconnected
    });
  }
  return redis;
}

/**
 * Cache with TTL (default: 5 minutes)
 * @param {string} key - Cache key
 * @param {*} data - Data to cache (will be JSON.stringified)
 * @param {number} ttl - Time to live in seconds (default: 300)
 */
async function setCache(key, data, ttl = 300) {
  try {
    const client = getRedis();
    if (!client || client.status !== 'ready') {
      return; // Fast bypass if offline
    }
    await client.setex(key, ttl, JSON.stringify(data));
  } catch (_err) {
    // Fail silently — cache degradation should never break requests
  }
}

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {Promise<*|null>} Parsed data or null
 */
async function getCache(key) {
  try {
    const client = getRedis();
    if (!client || client.status !== 'ready') {
      return null; // Fast bypass if offline (0ms overhead)
    }
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (_err) {
    return null;
  }
}

/**
 * Invalidate cache by key or pattern
 * @param {string} pattern - Key or pattern (e.g., "dashboard:*")
 */
async function invalidateCache(pattern) {
  try {
    const client = getRedis();
    if (!client || client.status !== 'ready') {
      return; // Fast bypass if offline
    }
    if (pattern.includes('*')) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } else {
      await client.del(pattern);
    }
  } catch (_err) {
    // Fail silently
  }
}

/**
 * Gracefully close Redis connection
 */
async function closeRedis() {
  if (redis) {
    try {
      await redis.quit();
    } catch (_e) {
      redis.disconnect();
    }
    redis = null;
    loggedOfflineWarning = false;
  }
}

module.exports = { getRedis, setCache, getCache, invalidateCache, closeRedis };
