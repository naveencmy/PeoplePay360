const request = require('supertest');
const app = require('../../src/app');
const { query, closePool } = require('../../src/config/database');
const { generateAccessToken } = require('../../src/config/jwt');

describe('Comprehensive RBAC, Limit Checks & Edge-Case Protection Suite', () => {
  let adminToken;
  let hrToken;
  let managerToken;
  let auditorToken;
  let employeeToken;

  let adminUser;
  let hrUser;
  let managerUser;
  let auditorUser;
  let employeeUser;
  let anotherEmployeeUser;

  let paidPayrun;
  let computedPayrun;
  let draftPayrun;
  let samplePayslip;

  beforeAll(async () => {
    // 1. Fetch user accounts for all roles
    const usersRes = await query(`
      SELECT u.id, u.email, u.role, u.employee_id, e.first_name, e.last_name
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
      WHERE u.deleted_at IS NULL
    `);

    adminUser = usersRes.rows.find(u => u.role === 'ADMIN');
    hrUser = usersRes.rows.find(u => u.role === 'HR');
    managerUser = usersRes.rows.find(u => u.role === 'MANAGER');
    auditorUser = usersRes.rows.find(u => u.role === 'AUDITOR');
    
    const employees = usersRes.rows.filter(u => u.role === 'EMPLOYEE');
    employeeUser = employees[0];
    anotherEmployeeUser = employees[1] || employees[0];

    // Generate tokens for each role
    adminToken = generateAccessToken({
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      employeeId: adminUser.employee_id,
    });

    hrToken = generateAccessToken({
      userId: hrUser.id,
      email: hrUser.email,
      role: hrUser.role,
      employeeId: hrUser.employee_id,
    });

    managerToken = generateAccessToken({
      userId: managerUser.id,
      email: managerUser.email,
      role: managerUser.role,
      employeeId: managerUser.employee_id,
    });

    auditorToken = generateAccessToken({
      userId: auditorUser.id,
      email: auditorUser.email,
      role: auditorUser.role,
      employeeId: auditorUser.employee_id,
    });

    employeeToken = generateAccessToken({
      userId: employeeUser.id,
      email: employeeUser.email,
      role: employeeUser.role,
      employeeId: employeeUser.employee_id,
    });

    // 2. Fetch payruns for state machine testing
    const payrunsRes = await query(`
      SELECT id, name, state FROM payruns ORDER BY period_start ASC
    `);
    paidPayrun = payrunsRes.rows.find(p => p.state === 'PAID');
    computedPayrun = payrunsRes.rows.find(p => p.state === 'COMPUTED');
    draftPayrun = payrunsRes.rows.find(p => p.state === 'DRAFT');

    // 3. Fetch sample payslip not belonging to employeeUser
    const payslipsRes = await query(`
      SELECT id, employee_id FROM payslips WHERE employee_id != $1 LIMIT 1
    `, [employeeUser.employee_id]);
    samplePayslip = payslipsRes.rows[0];
  });

  afterAll(async () => {
    await closePool();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSION MATRICES
  // ═══════════════════════════════════════════════════════════════════════════
  describe('RBAC Verification Across All 5 Categories', () => {

    describe('ADMIN Role Privileges', () => {
      it('can access user master directory', async () => {
        const res = await request(app)
          .get('/api/auth/users')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
      });

      it('can list contracts across the enterprise', async () => {
        const res = await request(app)
          .get('/api/contracts')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
      });

      it('can access dashboard KPI metrics', async () => {
        const res = await request(app)
          .get('/api/dashboard/kpis')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('total_employees');
        expect(res.body.data.total_employees).toBeGreaterThanOrEqual(70);
      });

      it('can view salary structures and rules', async () => {
        const res = await request(app)
          .get('/api/salary')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
      });
    });

    describe('HR Role Privileges & Boundaries', () => {
      it('can list enterprise contracts', async () => {
        const res = await request(app)
          .get('/api/contracts')
          .set('Authorization', `Bearer ${hrToken}`);
        expect(res.status).toBe(200);
      });

      it('can list payruns', async () => {
        const res = await request(app)
          .get('/api/payruns')
          .set('Authorization', `Bearer ${hrToken}`);
        expect(res.status).toBe(200);
      });

      it('can view salary structures', async () => {
        const res = await request(app)
          .get('/api/salary')
          .set('Authorization', `Bearer ${hrToken}`);
        expect(res.status).toBe(200);
      });
    });

    describe('MANAGER Role Limits & Kill-Switch', () => {
      it('can view dashboard metrics for operational oversight', async () => {
        const res = await request(app)
          .get('/api/dashboard/kpis')
          .set('Authorization', `Bearer ${managerToken}`);
        expect(res.status).toBe(200);
      });

      it('can view pending timeoff requests for reports', async () => {
        const res = await request(app)
          .get('/api/timeoff/pending')
          .set('Authorization', `Bearer ${managerToken}`);
        expect(res.status).toBe(200);
      });

      it('KILL-SWITCH: Manager is BLOCKED from listing enterprise contracts', async () => {
        const res = await request(app)
          .get('/api/contracts')
          .set('Authorization', `Bearer ${managerToken}`);
        expect(res.status).toBe(403);
      });

      it('KILL-SWITCH: Manager is BLOCKED from mutating or creating payruns', async () => {
        const res = await request(app)
          .post('/api/payruns')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            name: 'Malicious Manager Payrun',
            period_start: '2026-10-01',
            period_end: '2026-10-31',
            structure_id: '01a073fa-be82-7ee3-88eb-e01869e54d19',
          });
        expect(res.status).toBe(403);
      });

      it('KILL-SWITCH: Manager is BLOCKED from creating salary structures', async () => {
        const res = await request(app)
          .post('/api/salary')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({ name: 'Unauthorized Structure', code: 'UNAUTH' });
        expect(res.status).toBe(403);
      });
    });

    describe('AUDITOR Role Compliance & Read-Only Enforcement', () => {
      it('can read payruns for audit inspection', async () => {
        const res = await request(app)
          .get('/api/payruns')
          .set('Authorization', `Bearer ${auditorToken}`);
        expect(res.status).toBe(200);
      });

      it('can read contracts for statutory review', async () => {
        const res = await request(app)
          .get('/api/contracts')
          .set('Authorization', `Bearer ${auditorToken}`);
        expect(res.status).toBe(200);
      });

      it('can inspect salary structures', async () => {
        const res = await request(app)
          .get('/api/salary')
          .set('Authorization', `Bearer ${auditorToken}`);
        expect(res.status).toBe(200);
      });

      it('KILL-SWITCH: Auditor cannot create or mutate payruns', async () => {
        const res = await request(app)
          .post('/api/payruns')
          .set('Authorization', `Bearer ${auditorToken}`)
          .send({
            name: 'Auditor Attempted Run',
            period_start: '2026-10-01',
            period_end: '2026-10-31',
            structure_id: '01a073fa-be82-7ee3-88eb-e01869e54d19',
          });
        expect(res.status).toBe(403);
      });

      it('KILL-SWITCH: Auditor cannot create contracts', async () => {
        const res = await request(app)
          .post('/api/contracts')
          .set('Authorization', `Bearer ${auditorToken}`)
          .send({ wage: 50000 });
        expect(res.status).toBe(403);
      });

      it('KILL-SWITCH: Auditor cannot dispatch payslip emails', async () => {
        if (samplePayslip) {
          const res = await request(app)
            .post(`/api/payslips/${samplePayslip.id}/email`)
            .set('Authorization', `Bearer ${auditorToken}`);
          expect(res.status).toBe(403);
        }
      });
    });

    describe('EMPLOYEE Role Strict Isolation & Anti-IDOR Protections', () => {
      it('can view own employee profile', async () => {
        const res = await request(app)
          .get(`/api/employees/${employeeUser.employee_id}`)
          .set('Authorization', `Bearer ${employeeToken}`);
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(employeeUser.employee_id);
      });

      it('KILL-SWITCH: Employee viewing another employee has sensitive PII masked (PAN, Bank, IFSC)', async () => {
        const res = await request(app)
          .get(`/api/employees/${anotherEmployeeUser.employee_id}`)
          .set('Authorization', `Bearer ${employeeToken}`);
        expect(res.status).toBe(200);
        expect(res.body.data.pan_number).toBeUndefined();
        expect(res.body.data.bank_account_number).toBeUndefined();
        expect(res.body.data.bank_ifsc).toBeUndefined();
      });

      it('KILL-SWITCH: Employee is BLOCKED from viewing another employee contracts', async () => {
        const res = await request(app)
          .get(`/api/contracts/employee/${anotherEmployeeUser.employee_id}`)
          .set('Authorization', `Bearer ${employeeToken}`);
        expect(res.status).toBe(403);
      });

      it('KILL-SWITCH: Employee is BLOCKED from viewing another employee payslips directly', async () => {
        if (samplePayslip) {
          const res = await request(app)
            .get(`/api/payslips/${samplePayslip.id}`)
            .set('Authorization', `Bearer ${employeeToken}`);
          expect(res.status).toBe(403);
        }
      });

      it('KILL-SWITCH: Employee is BLOCKED from accessing global user list', async () => {
        const res = await request(app)
          .get('/api/auth/users')
          .set('Authorization', `Bearer ${employeeToken}`);
        expect(res.status).toBe(403);
      });

      it('KILL-SWITCH: Employee is BLOCKED from listing company contracts', async () => {
        const res = await request(app)
          .get('/api/contracts')
          .set('Authorization', `Bearer ${employeeToken}`);
        expect(res.status).toBe(403);
      });

      it('KILL-SWITCH: Employee is BLOCKED from listing payruns', async () => {
        const res = await request(app)
          .get('/api/payruns')
          .set('Authorization', `Bearer ${employeeToken}`);
        expect(res.status).toBe(403);
      });

      it('KILL-SWITCH: Employee is BLOCKED from accessing executive dashboard metrics', async () => {
        const res = await request(app)
          .get('/api/dashboard/kpis')
          .set('Authorization', `Bearer ${employeeToken}`);
        expect(res.status).toBe(403);
      });

      it('KILL-SWITCH: Employee spoofing another employee ID for leave request is rejected', async () => {
        const res = await request(app)
          .post('/api/timeoff')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            employee_id: anotherEmployeeUser.employee_id,
            leave_type: 'CASUAL',
            date_from: '2026-10-10',
            date_to: '2026-10-12',
            duration: 3,
            reason: 'Spoofed request attempt',
          });
        expect(res.status).toBe(403);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. STATE MACHINE TRANSITIONS & BOUNDARY GUARDS
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Payrun State Machine Guardrails & Boundary Checks', () => {
    it('KILL-SWITCH: Cannot validate or compute a PAID payrun (state invariant)', async () => {
      if (paidPayrun) {
        const res = await request(app)
          .put(`/api/payruns/${paidPayrun.id}/validate`)
          .set('Authorization', `Bearer ${adminToken}`);
        expect([400, 409]).toContain(res.status);
      }
    });

    it('KILL-SWITCH: Cannot delete a PAID payrun (only DRAFT can be deleted)', async () => {
      if (paidPayrun) {
        const res = await request(app)
          .delete(`/api/payruns/${paidPayrun.id}`)
          .set('Authorization', `Bearer ${adminToken}`);
        expect([400, 409]).toContain(res.status);
      }
    });

    it('KILL-SWITCH: Cannot delete a COMPUTED payrun', async () => {
      if (computedPayrun) {
        const res = await request(app)
          .delete(`/api/payruns/${computedPayrun.id}`)
          .set('Authorization', `Bearer ${adminToken}`);
        expect([400, 409]).toContain(res.status);
      }
    });

    it('KILL-SWITCH: Malformed UUID in route parameters returns 422 Unprocessable Entity', async () => {
      const res = await request(app)
        .get('/api/payruns/not-a-valid-uuid')
        .set('Authorization', `Bearer ${adminToken}`);
      expect([400, 422]).toContain(res.status);
    });

    it('Paginates large 72-employee directory with valid boundary limits', async () => {
      const res = await request(app)
        .get('/api/employees?page=1&limit=50')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(50);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(70);
    });
  });
});
