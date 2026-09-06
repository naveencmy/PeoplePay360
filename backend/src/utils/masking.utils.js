// ─────────────────────────────────────────────────────────────────────────────
// PII Masking & Data Sanitization Utility
// Protects Bank Account Numbers, IFSC codes, PAN credentials, and Secrets
// ─────────────────────────────────────────────────────────────────────────────

const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'new_password',
  'old_password',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'jwt_secret',
  'jwt_refresh_secret',
]);

const PII_MASK_KEYS = {
  bank_account_number: (val) => maskString(val, 4),
  bank_ifsc: (val) => maskString(val, 4),
  pan_number: (val) => maskString(val, 3),
  uan_number: (val) => maskString(val, 4),
  phone: (val) => maskString(val, 4),
};

/**
 * Mask string keeping only the last N characters
 */
function maskString(str, visibleTrailing = 4) {
  if (!str || typeof str !== 'string') return str;
  if (str.length <= visibleTrailing) return '••••';
  const maskedSection = '•'.repeat(Math.min(8, str.length - visibleTrailing));
  return `${maskedSection}${str.slice(-visibleTrailing)}`;
}

/**
 * Recursively sanitize objects, arrays, and primitives for safe structured logging
 */
function sanitizeLogPayload(data, depth = 0) {
  if (depth > 5 || data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogPayload(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]';
    } else if (PII_MASK_KEYS[lowerKey]) {
      sanitized[key] = PII_MASK_KEYS[lowerKey](value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogPayload(value, depth + 1);
    } else if (typeof value === 'string') {
      // Regex check for stray PAN patterns (5 letters, 4 digits, 1 letter)
      if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(value)) {
        sanitized[key] = maskString(value, 3);
      } else {
        sanitized[key] = value;
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

module.exports = {
  maskString,
  sanitizeLogPayload,
};
