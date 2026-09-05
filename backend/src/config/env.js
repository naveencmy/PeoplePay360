const { z } = require('zod');

// ─────────────────────────────────────────────────────────────────────────────
// Environment Variable Schema — validated at startup, fail-fast on misconfiguration
// ─────────────────────────────────────────────────────────────────────────────

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // PostgreSQL
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default('peoplepay360'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_SSL: z.coerce.boolean().default(false),
  DB_POOL_MIN: z.coerce.number().default(2),
  DB_POOL_MAX: z.coerce.number().default(10),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),

  // JWT
  JWT_SECRET: z.string().default('peoplepay360-dev-secret-change-in-prod'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().default('peoplepay360-refresh-secret-change-in-prod'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Email (Nodemailer)
  SMTP_HOST: z.string().default('smtp.ethereal.email'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default('payroll@peoplepay360.com'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 min
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // Company Defaults
  COMPANY_NAME: z.string().default('PeoplePay360'),
  CURRENCY_CODE: z.string().default('INR'),
  CURRENCY_SYMBOL: z.string().default('₹'),
  MIN_WAGE: z.coerce.number().default(15000),
});

let env;

function loadEnv() {
  if (!env) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error('❌ Invalid environment variables:');
      console.error(result.error.flatten().fieldErrors);
      process.exit(1);
    }
    env = Object.freeze(result.data);
  }
  return env;
}

module.exports = { loadEnv, envSchema };
