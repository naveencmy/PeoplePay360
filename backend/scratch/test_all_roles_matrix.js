const request = require('supertest');
const app = require('../src/app');
const { query, closePool } = require('../src/config/database');
const { generateAccessToken } = require('../src/config/jwt');

async function runExhaustiveRoleAudit() {
  console.log('========================================================================');
  console.log('   PEOPLEPAY360 EXHAUSTIVE 5-ROLE ACCESS CONTROL & LIMIT AUDIT');
  console.log('========================================================================\n');

  // 1. Fetch live user accounts for each role
  const usersRes = await query(`
    SELECT u.id, u.email, u.role, u.employee_id, e.first_name, e.last_name
    FROM users u
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE u.deleted_at IS NULL
  `);

  const usersByRole = {
    ADMIN: usersRes.rows.find(u => u.role === 'ADMIN'),
    HR: usersRes.rows.find(u => u.role === 'HR'),
    MANAGER: usersRes.rows.find(u => u.role === 'MANAGER'),
    AUDITOR: usersRes.rows.find(u => u.role === 'AUDITOR'),
    EMPLOYEE: usersRes.rows.find(u => u.role === 'EMPLOYEE'),
  };

  const employees = usersRes.rows.filter(u => u.role === 'EMPLOYEE');
  const coworkerUser = employees.find(u => u.id !== usersByRole.EMPLOYEE.id) || employees[1];

  console.log('Active Test Accounts:');
  for (const [role, user] of Object.entries(usersByRole)) {
    console.log(`  [${role.padEnd(8)}] ${user.email} (UID: ${user.id.slice(0, 8)}..., EmpID: ${user.employee_id?.slice(0, 8)}...)`);
  }
  console.log(`  [COWORKER] ${coworkerUser.email} (EmpID: ${coworkerUser.employee_id?.slice(0, 8)}...)\n`);

  const tokens = {};
  for (const [role, user] of Object.entries(usersByRole)) {
    tokens[role] = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employee_id,
    });
  }

  // Fetch a sample payslip belonging to coworker
  const coworkerPayslipRes = await query(`
    SELECT id, employee_id FROM payslips WHERE employee_id = $1 LIMIT 1
  `, [coworkerUser.employee_id]);
  const coworkerPayslip = coworkerPayslipRes.rows[0];

  // Fetch sample salary structure
  const structRes = await query(`SELECT id FROM salary_structures LIMIT 1`);
  const sampleStructId = structRes.rows[0]?.id;

  // Fetch sample payrun
  const payrunRes = await query(`SELECT id, state FROM payruns LIMIT 1`);
  const samplePayrunId = payrunRes.rows[0]?.id;

  let passed = 0;
  let failed = 0;

  function assertResult(testName, actualStatus, expectedStatuses, details = '') {
    const isOk = Array.isArray(expectedStatuses) 
      ? expectedStatuses.includes(actualStatus) 
      : actualStatus === expectedStatuses;

    if (isOk) {
      console.log(`  ✅ [PASS] ${testName} -> HTTP ${actualStatus}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} -> Got ${actualStatus}, expected ${JSON.stringify(expectedStatuses)} ${details}`);
      failed++;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 1. EMPLOYEE ROLE RIGID CHECKS (CONFIRMED ZERO PRIVILEGES OUTSIDE SELF)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('--- 1. Testing EMPLOYEE Role Isolation & IDOR Protections ---');
  const empToken = tokens.EMPLOYEE;

  // Enterprise Contracts (Must be 403)
  let res = await request(app).get('/api/contracts').set('Authorization', `Bearer ${empToken}`);
  assertResult('Employee blocked from listing all enterprise contracts', res.status, 403);

  // Coworker Contracts IDOR (Must be 403)
  res = await request(app).get(`/api/contracts/employee/${coworkerUser.employee_id}`).set('Authorization', `Bearer ${empToken}`);
  assertResult('Employee blocked from viewing coworker contracts (IDOR)', res.status, 403);

  // Own Contracts (Must be 200)
  res = await request(app).get(`/api/contracts/employee/${usersByRole.EMPLOYEE.employee_id}`).set('Authorization', `Bearer ${empToken}`);
  assertResult('Employee permitted to view own contracts', res.status, 200);

  // Salary Structures (Must be 403)
  res = await request(app).get('/api/salary').set('Authorization', `Bearer ${empToken}`);
  assertResult('Employee blocked from inspecting salary structures', res.status, 403);

  // Payruns (Must be 403)
  res = await request(app).get('/api/payruns').set('Authorization', `Bearer ${empToken}`);
  assertResult('Employee blocked from listing payruns', res.status, 403);

  // Executive Dashboard KPIs (Must be 403)
  res = await request(app).get('/api/dashboard/kpis').set('Authorization', `Bearer ${empToken}`);
  assertResult('Employee blocked from executive dashboard KPIs', res.status, 403);

  // User Administration (Must be 403)
  res = await request(app).get('/api/auth/users').set('Authorization', `Bearer ${empToken}`);
  assertResult('Employee blocked from user management master list', res.status, 403);

  // Coworker PII Masking on Employee Directory
  res = await request(app).get(`/api/employees/${coworkerUser.employee_id}`).set('Authorization', `Bearer ${empToken}`);
  const empData = res.body?.data || {};
  const isPiiMasked = empData.pan_number === undefined && empData.bank_account_number === undefined && empData.bank_ifsc === undefined && empData.wage === undefined;
  assertResult('Employee viewing coworker automatically masks sensitive PII (PAN, Bank, IFSC, Wage)', isPiiMasked ? 200 : 500, 200);

  // Coworker Payslip IDOR (Must be 403)
  if (coworkerPayslip) {
    res = await request(app).get(`/api/payslips/${coworkerPayslip.id}`).set('Authorization', `Bearer ${empToken}`);
    assertResult('Employee blocked from viewing coworker payslip (IDOR)', res.status, 403);

    res = await request(app).get(`/api/payslips/${coworkerPayslip.id}/pdf`).set('Authorization', `Bearer ${empToken}`);
    assertResult('Employee blocked from downloading coworker payslip PDF (IDOR)', res.status, 403);
  }

  // Employee ID Spoofing on Time-Off Request (Must be 403)
  res = await request(app).post('/api/timeoff').set('Authorization', `Bearer ${empToken}`).send({
    employee_id: coworkerUser.employee_id,
    leave_type: 'CASUAL',
    date_from: '2026-11-01',
    date_to: '2026-11-03',
    duration: 3,
    reason: 'Spoofed attempt',
  });
  assertResult('Employee ID spoofing on time-off request is blocked', res.status, 403);

  // Mutations Blocked for Employee:
  res = await request(app).post('/api/employees').set('Authorization', `Bearer ${empToken}`).send({ first_name: 'Hack' });
  assertResult('Employee blocked from creating employee record', res.status, 403);

  res = await request(app).put(`/api/employees/${coworkerUser.employee_id}`).set('Authorization', `Bearer ${empToken}`).send({ first_name: 'Hack' });
  assertResult('Employee blocked from updating employee record', res.status, 403);

  res = await request(app).delete(`/api/employees/${coworkerUser.employee_id}`).set('Authorization', `Bearer ${empToken}`);
  assertResult('Employee blocked from deleting employee record', res.status, 403);

  res = await request(app).post('/api/contracts').set('Authorization', `Bearer ${empToken}`).send({ wage: 999999 });
  assertResult('Employee blocked from creating contract', res.status, 403);

  res = await request(app).post('/api/payruns').set('Authorization', `Bearer ${empToken}`).send({ name: 'Malicious Payrun' });
  assertResult('Employee blocked from creating payrun', res.status, 403);

  res = await request(app).post('/api/salary').set('Authorization', `Bearer ${empToken}`).send({ name: 'Malicious Structure' });
  assertResult('Employee blocked from creating salary structure', res.status, 403);

  res = await request(app).post('/api/attendance/bulk').set('Authorization', `Bearer ${empToken}`).send({ records: [] });
  assertResult('Employee blocked from bulk attendance import', res.status, 403);

  // ───────────────────────────────────────────────────────────────────────────
  // 2. AUDITOR ROLE RIGID CHECKS (READ-ONLY INSPECTION, ZERO MUTATIONS)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- 2. Testing AUDITOR Role (Read-Only Inspection & Mutation Kill-Switches) ---');
  const audToken = tokens.AUDITOR;

  // Reads Permitted:
  res = await request(app).get('/api/contracts').set('Authorization', `Bearer ${audToken}`);
  assertResult('Auditor permitted to read enterprise contracts catalog', res.status, 200);

  res = await request(app).get('/api/payruns').set('Authorization', `Bearer ${audToken}`);
  assertResult('Auditor permitted to read payruns history', res.status, 200);

  res = await request(app).get('/api/salary').set('Authorization', `Bearer ${audToken}`);
  assertResult('Auditor permitted to inspect salary structures & formulas', res.status, 200);

  res = await request(app).get('/api/dashboard/kpis').set('Authorization', `Bearer ${audToken}`);
  assertResult('Auditor permitted to view dashboard KPIs', res.status, 200);

  // Mutations Blocked:
  res = await request(app).post('/api/contracts').set('Authorization', `Bearer ${audToken}`).send({ wage: 50000 });
  assertResult('Auditor blocked from creating contracts (Mutation Kill-Switch)', res.status, 403);

  res = await request(app).post('/api/payruns').set('Authorization', `Bearer ${audToken}`).send({ name: 'Auditor Run' });
  assertResult('Auditor blocked from creating payruns (Mutation Kill-Switch)', res.status, 403);

  if (samplePayrunId) {
    res = await request(app).post(`/api/payruns/${samplePayrunId}/compute`).set('Authorization', `Bearer ${audToken}`);
    assertResult('Auditor blocked from computing payruns (Mutation Kill-Switch)', res.status, 403);

    res = await request(app).put(`/api/payruns/${samplePayrunId}/validate`).set('Authorization', `Bearer ${audToken}`);
    assertResult('Auditor blocked from validating payruns (Mutation Kill-Switch)', res.status, 403);

    res = await request(app).put(`/api/payruns/${samplePayrunId}/mark-paid`).set('Authorization', `Bearer ${audToken}`);
    assertResult('Auditor blocked from disbursing payruns (Mutation Kill-Switch)', res.status, 403);

    res = await request(app).delete(`/api/payruns/${samplePayrunId}`).set('Authorization', `Bearer ${audToken}`);
    assertResult('Auditor blocked from deleting payruns (Mutation Kill-Switch)', res.status, 403);
  }

  res = await request(app).post('/api/salary').set('Authorization', `Bearer ${audToken}`).send({ name: 'Auditor Rule' });
  assertResult('Auditor blocked from creating salary structures (Mutation Kill-Switch)', res.status, 403);

  res = await request(app).post('/api/employees').set('Authorization', `Bearer ${audToken}`).send({ first_name: 'Auditor Emp' });
  assertResult('Auditor blocked from creating employees (Mutation Kill-Switch)', res.status, 403);

  res = await request(app).get('/api/auth/users').set('Authorization', `Bearer ${audToken}`);
  assertResult('Auditor blocked from user governance master list', res.status, 403);

  // ───────────────────────────────────────────────────────────────────────────
  // 3. MANAGER ROLE CHECKS (TEAM OVERSIGHT, BLOCKED FROM ENTERPRISE MODULES)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- 3. Testing MANAGER Role (Team Oversight & Module Isolation) ---');
  const mgrToken = tokens.MANAGER;

  res = await request(app).get('/api/dashboard/kpis').set('Authorization', `Bearer ${mgrToken}`);
  assertResult('Manager permitted to view team dashboard KPIs', res.status, 200);

  res = await request(app).get('/api/timeoff/pending').set('Authorization', `Bearer ${mgrToken}`);
  assertResult('Manager permitted to inspect pending team leave requests', res.status, 200);

  res = await request(app).get('/api/contracts').set('Authorization', `Bearer ${mgrToken}`);
  assertResult('Manager blocked from inspecting enterprise contracts', res.status, 403);

  res = await request(app).get('/api/salary').set('Authorization', `Bearer ${mgrToken}`);
  assertResult('Manager blocked from inspecting salary structures', res.status, 403);

  res = await request(app).get('/api/payruns').set('Authorization', `Bearer ${mgrToken}`);
  assertResult('Manager blocked from inspecting payroll payruns', res.status, 403);

  res = await request(app).get('/api/auth/users').set('Authorization', `Bearer ${mgrToken}`);
  assertResult('Manager blocked from user governance', res.status, 403);

  // ───────────────────────────────────────────────────────────────────────────
  // 4. HR ROLE CHECKS (WORKFORCE & PAYROLL OPERATIONS, BLOCKED FROM ROOT USER ADMIN)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- 4. Testing HR Role Operations & Boundaries ---');
  const hrToken = tokens.HR;

  res = await request(app).get('/api/contracts').set('Authorization', `Bearer ${hrToken}`);
  assertResult('HR permitted to list enterprise contracts', res.status, 200);

  res = await request(app).get('/api/payruns').set('Authorization', `Bearer ${hrToken}`);
  assertResult('HR permitted to list payruns', res.status, 200);

  res = await request(app).get('/api/salary').set('Authorization', `Bearer ${hrToken}`);
  assertResult('HR permitted to manage salary structures', res.status, 200);

  res = await request(app).get('/api/auth/users').set('Authorization', `Bearer ${hrToken}`);
  assertResult('HR permitted to inspect user listing (audit view)', res.status, 200);

  res = await request(app).put(`/api/auth/users/${usersByRole.EMPLOYEE.id}`).set('Authorization', `Bearer ${hrToken}`).send({ role: 'ADMIN' });
  assertResult('HR blocked from promoting users or editing user credentials (Root Admin Only)', res.status, 403);

  // ───────────────────────────────────────────────────────────────────────────
  // 5. ADMIN ROLE CHECKS (FULL ENTERPRISE GOVERNANCE)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- 5. Testing ADMIN Role Governance ---');
  const adminToken = tokens.ADMIN;

  res = await request(app).get('/api/auth/users').set('Authorization', `Bearer ${adminToken}`);
  assertResult('Admin permitted to inspect full user directory', res.status, 200);

  res = await request(app).put(`/api/auth/users/${usersByRole.EMPLOYEE.id}`).set('Authorization', `Bearer ${adminToken}`).send({ role: 'EMPLOYEE' });
  assertResult('Admin permitted to configure user role & access', res.status, 200);

  res = await request(app).get('/api/contracts').set('Authorization', `Bearer ${adminToken}`);
  assertResult('Admin permitted to manage contracts', res.status, 200);

  res = await request(app).get('/api/payruns').set('Authorization', `Bearer ${adminToken}`);
  assertResult('Admin permitted to manage payruns', res.status, 200);

  console.log('\n========================================================================');
  console.log(`   AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED across 5 ROLES`);
  console.log('========================================================================\n');

  await closePool();
  process.exit(failed > 0 ? 1 : 0);
}

runExhaustiveRoleAudit().catch(err => {
  console.error('Fatal error during role audit:', err);
  process.exit(1);
});
