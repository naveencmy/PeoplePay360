// Mock pg-boss to test contract and behaviors without requiring live DB connection
jest.mock('pg-boss', () => {
  return jest.fn().mockImplementation((config) => ({
    config,
    on: jest.fn(),
    start: jest.fn().mockResolvedValue(true),
    stop: jest.fn().mockResolvedValue(true),
    work: jest.fn().mockResolvedValue('worker-id'),
    send: jest.fn().mockImplementation((name, data, options) => {
      return Promise.resolve(`job-${Math.random().toString(36).substring(7)}`);
    }),
    insert: jest.fn().mockImplementation((jobs) => {
      return Promise.resolve(jobs.length);
    }),
    schedule: jest.fn().mockResolvedValue(true),
  }));
});

// Mock database query for observability tests
jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  getClient: jest.fn(),
  withTransaction: jest.fn(),
  closePool: jest.fn(),
}));

const boss = require('../../src/jobs/queue');
const {
  enqueuePayrunCompute,
  enqueuePayslipPDF,
  enqueuePayslipEmail,
  enqueueBatchPayslipEmails,
  enqueueAnomalyScan,
  initializeJobs,
  getQueueDepth,
  getOldestUnprocessedJob,
  getFailedJobs,
  getWorkerPerformance,
} = require('../../src/jobs');
const { query } = require('../../src/config/database');

describe('SECTION C: pg-boss Background Job Queue', () => {
  describe('C.2 Queue Configuration', () => {
    test('configures pg-boss with retry, lease expiration and polling intervals', () => {
      expect(boss.config).toBeDefined();
      expect(boss.config.retryLimit).toBe(3);
      expect(boss.config.retryDelay).toBe(30);
      expect(boss.config.retryBackoff).toBe(true);
      expect(boss.config.expireInMinutes).toBe(60);
      expect(boss.config.retentionDays).toBe(7);
      expect(boss.config.pollInterval).toBe(2000);
    });

    test('initializes all workers and recurring schedules on initializeJobs', async () => {
      await initializeJobs();
      expect(boss.work).toHaveBeenCalledWith('payrun.compute', expect.any(Object), expect.any(Function));
      expect(boss.work).toHaveBeenCalledWith('payslip.pdf', expect.any(Object), expect.any(Function));
      expect(boss.work).toHaveBeenCalledWith('payslip.email', expect.any(Object), expect.any(Function));
      expect(boss.work).toHaveBeenCalledWith('payroll.anomaly-scan', expect.any(Object), expect.any(Function));
      expect(boss.schedule).toHaveBeenCalledWith('monthly-payroll', '0 9 1 * *', expect.any(Object));
      expect(boss.schedule).toHaveBeenCalledWith('audit-cleanup', '0 2 * * *', expect.any(Object));
      expect(boss.schedule).toHaveBeenCalledWith('weekly-compliance', '0 9 * * 1', expect.any(Object));
    });
  });

  describe('C.3 & C.5 Job Enqueueing & Singleton Deduplication', () => {
    test('enqueues payrun.compute with singleton lock to prevent duplicate execution', async () => {
      const payrunId = 'payrun-123';
      const employeeIds = ['emp-1', 'emp-2', 'emp-3'];

      const jobId = await enqueuePayrunCompute(payrunId, employeeIds);

      expect(jobId).toBeDefined();
      expect(boss.send).toHaveBeenCalledWith(
        'payrun.compute',
        { payrunId, employeeIds },
        expect.objectContaining({
          singletonKey: `payrun-${payrunId}`,
          singletonMinutes: 30,
          priority: 1,
        })
      );
    });

    test('enqueues single payslip PDF generation', async () => {
      const jobId = await enqueuePayslipPDF('ps-001', 'emp-101');
      expect(jobId).toBeDefined();
      expect(boss.send).toHaveBeenCalledWith(
        'payslip.pdf',
        { payslipId: 'ps-001', employeeId: 'emp-101' },
        expect.objectContaining({
          retryLimit: 3,
          retryDelay: 30,
        })
      );
    });

    test('enqueues single payslip email', async () => {
      const jobId = await enqueuePayslipEmail('ps-001', 'john@company.com');
      expect(jobId).toBeDefined();
      expect(boss.send).toHaveBeenCalledWith(
        'payslip.email',
        { payslipId: 'ps-001', employeeEmail: 'john@company.com' },
        expect.objectContaining({
          retryLimit: 3,
          retryDelay: 60,
        })
      );
    });

    test('batch enqueues payslip emails via boss.insert() for ACID bulk delivery', async () => {
      const payslipItems = [
        { payslipId: 'ps-1', employeeEmail: 'alice@company.com' },
        { payslipId: 'ps-2', employeeEmail: 'bob@company.com' },
        { payslipId: 'ps-3', employeeEmail: 'carol@company.com' },
      ];

      const res = await enqueueBatchPayslipEmails(payslipItems);

      expect(res.queued).toBe(3);
      expect(boss.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'payslip.email',
            data: { payslipId: 'ps-1', employeeEmail: 'alice@company.com' },
            options: { retryLimit: 3, retryDelay: 60 },
          }),
          expect.objectContaining({
            name: 'payslip.email',
            data: { payslipId: 'ps-2', employeeEmail: 'bob@company.com' },
            options: { retryLimit: 3, retryDelay: 60 },
          }),
        ])
      );
    });

    test('enqueues anomaly scan job', async () => {
      const jobId = await enqueueAnomalyScan('payrun-456');
      expect(jobId).toBeDefined();
      expect(boss.send).toHaveBeenCalledWith(
        'payroll.anomaly-scan',
        { payrunId: 'payrun-456' },
        expect.objectContaining({ priority: 2 })
      );
    });
  });

  describe('C.7 Observability SQL Queries', () => {
    test('getQueueDepth queries pgboss.job grouped by name and state', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { name: 'payrun.compute', state: 'active', count: 1 },
          { name: 'payslip.email', state: 'completed', count: 45 },
        ],
      });

      const depths = await getQueueDepth();
      expect(depths).toHaveLength(2);
      expect(query).toHaveBeenCalledWith(expect.stringContaining('FROM pgboss.job'));
      expect(query).toHaveBeenCalledWith(expect.stringContaining('GROUP BY name, state'));
    });

    test('getOldestUnprocessedJob queries created state sorted by created_on ASC', async () => {
      query.mockResolvedValueOnce({
        rows: [{ name: 'payrun.compute', created_on: new Date(), data: { payrunId: 'p-1' } }],
      });

      const job = await getOldestUnprocessedJob();
      expect(job).toBeDefined();
      expect(job.name).toBe('payrun.compute');
      expect(query).toHaveBeenCalledWith(expect.stringContaining("WHERE state = 'created'"));
    });

    test('getFailedJobs queries dead letter jobs with error output', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { id: 'job-9', name: 'payslip.email', retrycount: 3, output: 'SMTP connection timeout' },
        ],
      });

      const failed = await getFailedJobs();
      expect(failed).toHaveLength(1);
      expect(failed[0].retrycount).toBe(3);
      expect(query).toHaveBeenCalledWith(expect.stringContaining("WHERE state = 'failed'"));
    });

    test('getWorkerPerformance calculates success, failure and avg execution duration', async () => {
      query.mockResolvedValueOnce({
        rows: [
          { name: 'payslip.pdf', success: 120, failed: 1, avg_duration_sec: 0.45 },
          { name: 'payslip.email', success: 250, failed: 2, avg_duration_sec: 1.12 },
        ],
      });

      const stats = await getWorkerPerformance();
      expect(stats).toHaveLength(2);
      expect(query).toHaveBeenCalledWith(expect.stringContaining('FILTER (WHERE state ='));
      expect(query).toHaveBeenCalledWith(expect.stringContaining('avg_duration_sec'));
    });
  });
});
