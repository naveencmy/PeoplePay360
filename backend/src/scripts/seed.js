const bcrypt = require('bcryptjs');
const { v7: uuidv7 } = require('uuid');
const { getPool, closePool } = require('../config/database');

async function seed() {
  const pool = getPool();
  const client = await pool.connect();

  console.log('🌱 Seeding PostgreSQL database with real production entities...');

  try {
    await client.query('BEGIN');

    // Clean existing data for clean seed
    await client.query('TRUNCATE users, employees, contracts, attendance, timeoff_requests, salary_structures, salary_rules, payruns, payslips, audit_logs CASCADE');

    const passwordHash = await bcrypt.hash('demo123', 10);

    // 1. Create Salary Structures & Rules
    console.log('Creating Salary Structures and Rules...');
    const structCorpId = uuidv7();
    await client.query(
      `INSERT INTO salary_structures (id, name, description, active)
       VALUES ($1, $2, $3, true)`,
      [structCorpId, 'Standard Indian Corporate Payroll', 'Statutory Indian structure with Basic, HRA, PF, PT, TDS']
    );

    const corpRules = [
      { id: uuidv7(), name: 'Basic Salary', code: 'BASIC', category: 'BASIC', sequence: 10, computation_type: 'PERCENTAGE', computation_basis: 'WAGE', amount: 0.40, formula: null, condition: null },
      { id: uuidv7(), name: 'House Rent Allowance', code: 'HRA', category: 'ALLOWANCE', sequence: 20, computation_type: 'PERCENTAGE', computation_basis: 'BASIC', amount: 0.50, formula: null, condition: null },
      { id: uuidv7(), name: 'Dearness Allowance', code: 'DA', category: 'ALLOWANCE', sequence: 30, computation_type: 'PERCENTAGE', computation_basis: 'BASIC', amount: 0.10, formula: null, condition: null },
      { id: uuidv7(), name: 'Special Allowance', code: 'SPECIAL_ALLOWANCE', category: 'ALLOWANCE', sequence: 40, computation_type: 'FORMULA', computation_basis: null, amount: 0, formula: 'WAGE - (BASIC + HRA + DA)', condition: null },
      { id: uuidv7(), name: 'Gross Salary', code: 'GROSS', category: 'GROSS', sequence: 50, computation_type: 'FORMULA', computation_basis: null, amount: 0, formula: 'BASIC + HRA + DA + SPECIAL_ALLOWANCE', condition: null },
      { id: uuidv7(), name: 'Provident Fund', code: 'PF', category: 'DEDUCTION', sequence: 60, computation_type: 'FORMULA', computation_basis: null, amount: 0, formula: 'min(BASIC * 0.12, 1800)', condition: null },
      { id: uuidv7(), name: 'Professional Tax', code: 'PT', category: 'DEDUCTION', sequence: 70, computation_type: 'FIXED', computation_basis: null, amount: 200, formula: null, condition: null },
      { id: uuidv7(), name: 'Tax Deducted at Source', code: 'TDS', category: 'DEDUCTION', sequence: 80, computation_type: 'FORMULA', computation_basis: null, amount: 0, formula: 'round(GROSS * 0.05)', condition: null },
      { id: uuidv7(), name: 'Net Salary', code: 'NET', category: 'NET', sequence: 90, computation_type: 'FORMULA', computation_basis: null, amount: 0, formula: 'GROSS - (PF + PT + TDS)', condition: null },
    ];

    for (const rule of corpRules) {
      await client.query(
        `INSERT INTO salary_rules (id, structure_id, name, code, category, sequence, computation_type, computation_basis, amount, formula, condition, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)`,
        [rule.id, structCorpId, rule.name, rule.code, rule.category, rule.sequence, rule.computation_type, rule.computation_basis, rule.amount, rule.formula, rule.condition]
      );
    }

    const structExecId = uuidv7();
    await client.query(
      `INSERT INTO salary_structures (id, name, description, active)
       VALUES ($1, $2, $3, true)`,
      [structExecId, 'Executive Leadership Package', 'Executive salary structure with LTA, performance bonus & 20% TDS']
    );

    const execRules = [
      { id: uuidv7(), name: 'Basic Salary', code: 'BASIC', category: 'BASIC', sequence: 10, computation_type: 'PERCENTAGE', computation_basis: 'WAGE', amount: 0.50, formula: null, condition: null },
      { id: uuidv7(), name: 'House Rent Allowance', code: 'HRA', category: 'ALLOWANCE', sequence: 20, computation_type: 'PERCENTAGE', computation_basis: 'BASIC', amount: 0.50, formula: null, condition: null },
      { id: uuidv7(), name: 'Leave Travel Allowance', code: 'LTA', category: 'ALLOWANCE', sequence: 30, computation_type: 'FIXED', computation_basis: null, amount: 15000, formula: null, condition: null },
      { id: uuidv7(), name: 'Performance Bonus', code: 'PERF_BONUS', category: 'ALLOWANCE', sequence: 40, computation_type: 'FORMULA', computation_basis: null, amount: 0, formula: 'WAGE * 0.15', condition: null },
      { id: uuidv7(), name: 'Gross Salary', code: 'GROSS', category: 'GROSS', sequence: 50, computation_type: 'FORMULA', computation_basis: null, amount: 0, formula: 'BASIC + HRA + LTA + PERF_BONUS', condition: null },
      { id: uuidv7(), name: 'Provident Fund', code: 'PF', category: 'DEDUCTION', sequence: 60, computation_type: 'FORMULA', computation_basis: null, amount: 0, formula: 'min(BASIC * 0.12, 1800)', condition: null },
      { id: uuidv7(), name: 'Professional Tax', code: 'PT', category: 'DEDUCTION', sequence: 70, computation_type: 'FIXED', computation_basis: null, amount: 200, formula: null, condition: null },
      { id: uuidv7(), name: 'Executive TDS', code: 'TDS', category: 'DEDUCTION', sequence: 80, computation_type: 'FORMULA', computation_basis: null, amount: 0, formula: 'round(GROSS * 0.20)', condition: null },
      { id: uuidv7(), name: 'Net Salary', code: 'NET', category: 'NET', sequence: 90, computation_type: 'FORMULA', computation_basis: null, amount: 0, formula: 'GROSS - (PF + PT + TDS)', condition: null },
    ];

    for (const rule of execRules) {
      await client.query(
        `INSERT INTO salary_rules (id, structure_id, name, code, category, sequence, computation_type, computation_basis, amount, formula, condition, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)`,
        [rule.id, structExecId, rule.name, rule.code, rule.category, rule.sequence, rule.computation_type, rule.computation_basis, rule.amount, rule.formula, rule.condition]
      );
    }

    // 2. Create Real Employees
    console.log('Creating Employees...');
    const employeesData = [
      { code: 'EMP-001', first_name: 'Rahul', last_name: 'Sharma', email: 'rahul.sharma@company.com', phone: '+91 98765 43210', department: 'Engineering', designation: 'Senior Frontend Engineer', wage: 85000, structId: structCorpId },
      { code: 'EMP-002', first_name: 'Priya', last_name: 'Patel', email: 'priya.patel@company.com', phone: '+91 98765 43211', department: 'Engineering', designation: 'Lead Backend Engineer', wage: 95000, structId: structCorpId },
      { code: 'EMP-003', first_name: 'Amit', last_name: 'Singh', email: 'amit.singh@company.com', phone: '+91 98765 43212', department: 'Engineering', designation: 'VP of Engineering', wage: 220000, structId: structExecId },
      { code: 'EMP-004', first_name: 'Neha', last_name: 'Gupta', email: 'neha.gupta@company.com', phone: '+91 98765 43213', department: 'Sales', designation: 'Enterprise Account Executive', wage: 75000, structId: structCorpId },
      { code: 'EMP-005', first_name: 'Vikram', last_name: 'Malhotra', email: 'vikram.malhotra@company.com', phone: '+91 98765 43214', department: 'Sales', designation: 'Director of Sales', wage: 180000, structId: structExecId },
      { code: 'EMP-006', first_name: 'Anjali', last_name: 'Desai', email: 'anjali.desai@company.com', phone: '+91 98765 43215', department: 'HR', designation: 'HR Director', wage: 140000, structId: structExecId },
      { code: 'EMP-007', first_name: 'Rohan', last_name: 'Kumar', email: 'rohan.kumar@company.com', phone: '+91 98765 43216', department: 'HR', designation: 'Talent Acquisition Specialist', wage: 60000, structId: structCorpId },
      { code: 'EMP-008', first_name: 'Pooja', last_name: 'Verma', email: 'pooja.verma@company.com', phone: '+91 98765 43217', department: 'Finance', designation: 'Chief Financial Officer', wage: 250000, structId: structExecId },
      { code: 'EMP-009', first_name: 'Sanjay', last_name: 'Reddy', email: 'sanjay.reddy@company.com', phone: '+91 98765 43218', department: 'Finance', designation: 'Senior Financial Analyst', wage: 80000, structId: structCorpId },
      { code: 'EMP-010', first_name: 'Kiran', last_name: 'Rao', email: 'kiran.rao@company.com', phone: '+91 98765 43219', department: 'Engineering', designation: 'Fullstack Engineer', wage: 70000, structId: structCorpId },
    ];

    const createdEmployees = [];

    for (const emp of employeesData) {
      const empId = uuidv7();
      await client.query(
        `INSERT INTO employees (
          id, employee_code, first_name, last_name, email, phone,
          date_of_birth, gender, department, designation, hire_date, work_location,
          bank_name, bank_account_number, bank_ifsc, pan_number, uan_number, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          '1992-05-15', 'Other', $7, $8, '2023-01-10', 'Bangalore HQ',
          'HDFC Bank', '50100234567890', 'HDFC0001234', 'ABCDE1234F', '101234567890', 'ACTIVE'
        )`,
        [empId, emp.code, emp.first_name, emp.last_name, emp.email, emp.phone, emp.department, emp.designation]
      );

      // Contract
      const contractId = uuidv7();
      await client.query(
        `INSERT INTO contracts (
          id, employee_id, name, wage, wage_type, structure_id,
          date_start, state, department, job_title
        ) VALUES (
          $1, $2, $3, $4, 'MONTHLY', $5,
          '2023-01-10', 'ACTIVE', $6, $7
        )`,
        [contractId, empId, `${emp.first_name} Employment Contract`, emp.wage, emp.structId, emp.department, emp.designation]
      );

      createdEmployees.push({ id: empId, contractId, ...emp });
    }

    // 3. Create Users
    console.log('Creating Users with demo accounts...');
    const usersData = [
      { email: 'admin@company.com', role: 'ADMIN', first_name: 'System', last_name: 'Admin', empId: createdEmployees[0].id },
      { email: 'hrmanager@company.com', role: 'HR', first_name: 'Anjali', last_name: 'Desai', empId: createdEmployees[5].id },
      { email: 'payroll@company.com', role: 'ADMIN', first_name: 'Pooja', last_name: 'Verma', empId: createdEmployees[7].id },
      { email: 'payrolluser@company.com', role: 'HR', first_name: 'Sanjay', last_name: 'Reddy', empId: createdEmployees[8].id },
      { email: 'employee@company.com', role: 'EMPLOYEE', first_name: 'Rahul', last_name: 'Sharma', empId: createdEmployees[0].id },
    ];

    for (const u of usersData) {
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, first_name, last_name, employee_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
        [uuidv7(), u.email, passwordHash, u.role, u.first_name, u.last_name, u.empId]
      );
    }

    // 4. Create Attendance Records for current month
    console.log('Creating Attendance Records...');
    for (const emp of createdEmployees) {
      for (let day = 1; day <= 22; day++) {
        const dayStr = String(day).padStart(2, '0');
        const date = `2026-09-${dayStr}`;
        await client.query(
          `INSERT INTO attendance (id, employee_id, date, check_in, check_out, worked_hours, status)
           VALUES ($1, $2, $3, $4, $5, 8.00, 'PRESENT')`,
          [uuidv7(), emp.id, date, `${date} 09:00:00+05:30`, `${date} 18:00:00+05:30`]
        );
      }
    }

    // 5. Create Time Off Requests
    console.log('Creating Time Off Requests...');
    await client.query(
      `INSERT INTO timeoff_requests (id, employee_id, leave_type, date_from, date_to, duration, reason, status)
       VALUES 
       ($1, $2, 'PAID_LEAVE', '2026-09-15', '2026-09-16', 2.0, 'Family vacation', 'APPROVED'),
       ($3, $4, 'SICK_LEAVE', '2026-09-20', '2026-09-20', 1.0, 'Medical appointment', 'APPROVED'),
       ($5, $6, 'CASUAL_LEAVE', '2026-09-28', '2026-09-29', 2.0, 'Personal work', 'PENDING')`,
      [uuidv7(), createdEmployees[0].id, uuidv7(), createdEmployees[1].id, uuidv7(), createdEmployees[3].id]
    );

    // 6. Create Initial Payrun in DRAFT
    console.log('Creating Payrun...');
    const payrunId = uuidv7();
    await client.query(
      `INSERT INTO payruns (id, name, period_start, period_end, structure_id, state, department, notes)
       VALUES ($1, $2, '2026-09-01', '2026-09-30', $3, 'DRAFT', 'All Departments', 'September 2026 Payroll Cycle')`,
      [payrunId, 'September 2026 Standard Payroll', structCorpId]
    );

    await client.query('COMMIT');
    console.log('✅ PostgreSQL database seeded successfully with 100% REAL entities!');
    console.log('Demo Logins (password: demo123):');
    console.log(' - admin@company.com (Super Admin)');
    console.log(' - hrmanager@company.com (HR Admin)');
    console.log(' - payroll@company.com (Payroll Officer)');
    console.log(' - employee@company.com (Employee)');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await closePool();
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
