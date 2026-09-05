const Redis = require('ioredis');
const { loadEnv } = require('./env');

// ─────────────────────────────────────────────────────────────────────────────
// Redis Client — singleton for caching & session management
// ─────────────────────────────────────────────────────────────────────────────

let redis = null;

function getRedis() {
  if (!redis) {
    const env = loadEnv();
    redis = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      db: env.REDIS_DB,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 3000);
        return delay;
      },
      lazyConnect: true,
    });

    redis.on('connect', () => {
      if (env.NODE_ENV === 'development') {
        console.log('🔴 Redis connected');
      }
    });

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
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
    await client.setex(key, ttl, JSON.stringify(data));
  } catch (err) {
    console.error('⚠️ Redis setCache error:', err.message);
    // Cache failures should not break the app — degrade gracefully
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
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('⚠️ Redis getCache error:', err.message);
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
    if (pattern.includes('*')) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } else {
      await client.del(pattern);
    }
  } catch (err) {
    console.error('⚠️ Redis invalidateCache error:', err.message);
  }
}

/**
 * Gracefully close Redis connection
 */
async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log('🔴 Redis connection closed');
  }
}

module.exports = { getRedis, setCache, getCache, invalidateCache, closeRedis };
