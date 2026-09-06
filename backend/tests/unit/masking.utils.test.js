const { maskString, sanitizeLogPayload } = require('../../src/utils/masking.utils');

describe('PII Masking & Log Sanitization Utility', () => {
  describe('maskString', () => {
    it('masks middle characters preserving last N digits', () => {
      expect(maskString('123456789012', 4)).toBe('••••••••9012');
      expect(maskString('HDFC0001234', 4)).toBe('•••••••1234');
      expect(maskString('ABCDE1234F', 3)).toBe('•••••••34F');
    });

    it('handles short strings safely', () => {
      expect(maskString('123', 4)).toBe('••••');
      expect(maskString(null, 4)).toBe(null);
      expect(maskString(undefined, 4)).toBe(undefined);
    });
  });

  describe('sanitizeLogPayload', () => {
    it('redacts sensitive auth tokens and passwords', () => {
      const payload = {
        email: 'user@example.com',
        password: 'superSecretPassword123',
        refresh_token: 'jwt.token.here',
        authorization: 'Bearer token',
      };

      const sanitized = sanitizeLogPayload(payload);
      expect(sanitized.email).toBe('user@example.com');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.refresh_token).toBe('[REDACTED]');
      expect(sanitized.authorization).toBe('[REDACTED]');
    });

    it('masks banking and PAN PII fields', () => {
      const payload = {
        first_name: 'John',
        last_name: 'Doe',
        bank_account_number: '987654321098',
        bank_ifsc: 'SBIN0001234',
        pan_number: 'ABCDE1234F',
        uan_number: '100987654321',
      };

      const sanitized = sanitizeLogPayload(payload);
      expect(sanitized.first_name).toBe('John');
      expect(sanitized.bank_account_number).toContain('1098');
      expect(sanitized.bank_account_number).toContain('•');
      expect(sanitized.bank_ifsc).toContain('1234');
      expect(sanitized.pan_number).toContain('34F');
      expect(sanitized.uan_number).toContain('4321');
    });

    it('recursively sanitizes nested objects and arrays', () => {
      const payload = {
        user: {
          profile: {
            password_hash: '$2a$10$...',
            bank_account_number: '112233445566',
          },
        },
        logs: [
          { token: 'secret-token-1', message: 'login' },
          { token: 'secret-token-2', message: 'logout' },
        ],
      };

      const sanitized = sanitizeLogPayload(payload);
      expect(sanitized.user.profile.password_hash).toBe('[REDACTED]');
      expect(sanitized.user.profile.bank_account_number).toContain('5566');
      expect(sanitized.logs[0].token).toBe('[REDACTED]');
      expect(sanitized.logs[1].token).toBe('[REDACTED]');
    });
  });
});
