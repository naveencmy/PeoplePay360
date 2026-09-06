const request = require('supertest');
const app = require('../../src/app');
const { getMetrics, getContentType } = require('../../src/config/metrics');

describe('Observability: Health Probes & Prometheus Metrics', () => {
  describe('GET /health (Liveness Probe)', () => {
    it('returns 200 OK with uptime and service metadata without external dependencies', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('peoplepay360-api');
      expect(typeof res.body.uptime).toBe('number');
      expect(res.body.timestamp).toBeDefined();
    });

    it('returns 200 OK on /api/health as well', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('GET /ready (Readiness Probe)', () => {
    it('returns structured diagnostic check for database and redis', async () => {
      const res = await request(app).get('/ready');
      expect([200, 503]).toContain(res.statusCode);
      expect(res.body.checks).toBeDefined();
      expect(res.body.checks.database).toBeDefined();
      expect(res.body.checks.redis).toBeDefined();
    });
  });

  describe('GET /metrics (Prometheus RED Metrics)', () => {
    it('returns valid Prometheus exposition format with standard metric types', async () => {
      const res = await request(app).get('/metrics');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.text).toContain('http_request_duration_seconds');
      expect(res.text).toContain('http_requests_total');
      expect(res.text).toContain('payroll_compute_duration_seconds');
    });

    it('exports getMetrics and getContentType helper functions', async () => {
      const contentType = getContentType();
      expect(contentType).toContain('text/plain');
      const metricsText = await getMetrics();
      expect(typeof metricsText).toBe('string');
      expect(metricsText).toContain('peoplepay360_');
    });
  });
});
