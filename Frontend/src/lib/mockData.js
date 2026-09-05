// src/lib/mockData.js
export const departments = [
  { id: 'DEP-001', name: 'Engineering', code: 'ENG', managerId: 'EMP-003' },
  { id: 'DEP-002', name: 'Sales', code: 'SAL', managerId: 'EMP-005' },
  { id: 'DEP-003', name: 'HR', code: 'HRD', managerId: 'EMP-006' },
  { id: 'DEP-004', name: 'Finance', code: 'FIN', managerId: 'EMP-008' }
];

export const jobPositions = [
  { id: 'JOB-001', title: 'Frontend Engineer', departmentId: 'DEP-001' },
  { id: 'JOB-002', title: 'Backend Engineer', departmentId: 'DEP-001' },
  { id: 'JOB-003', title: 'Engineering Manager', departmentId: 'DEP-001' },
  { id: 'JOB-004', title: 'Sales Executive', departmentId: 'DEP-002' },
  { id: 'JOB-005', title: 'Sales Manager', departmentId: 'DEP-002' },
  { id: 'JOB-006', title: 'HR Executive', departmentId: 'DEP-003' },
  { id: 'JOB-007', title: 'Finance Analyst', departmentId: 'DEP-004' },
  { id: 'JOB-008', title: 'Finance Manager', departmentId: 'DEP-004' }
];

export const workingSchedules = [
  {
    id: 'SCH-001', name: 'Standard Mon-Fri', hoursPerWeek: 40,
    lines: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', type: 'Work' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', type: 'Work' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', type: 'Work' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', type: 'Work' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', type: 'Work' },
      { dayOfWeek: 6, type: 'Rest' }, { dayOfWeek: 0, type: 'Rest' }
    ]
  },
  {
    id: 'SCH-002', name: 'Standard Mon-Sat', hoursPerWeek: 48,
    lines: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', type: 'Work' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', type: 'Work' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', type: 'Work' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', type: 'Work' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', type: 'Work' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '18:00', type: 'Work' },
      { dayOfWeek: 0, type: 'Rest' }
    ]
  },
  {
    id: 'SCH-003', name: 'Part Time Mon-Wed', hoursPerWeek: 24,
    lines: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', type: 'Work' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', type: 'Work' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', type: 'Work' },
      { dayOfWeek: 4, type: 'Rest' }, { dayOfWeek: 5, type: 'Rest' },
      { dayOfWeek: 6, type: 'Rest' }, { dayOfWeek: 0, type: 'Rest' }
    ]
  }
];

const names = [
  'Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Neha Gupta', 'Vikram Malhotra', 
  'Anjali Desai', 'Rohan Kumar', 'Pooja Verma', 'Sanjay Reddy', 'Kiran Rao', 
  'Arun Menon', 'Sneha Iyer', 'Karthik Nair', 'Kavita Pillai', 'Rajesh Choudhary', 
  'Meera Joshi', 'Sunil Agarwal', 'Swati Das', 'Mahesh Bhatt', 'Ritu Kapoor', 
  'Ashok Sengupta', 'Aarti Mukherjee'
];

export const employees = names.map((name, i) => {
  const idStr = String(i + 1).padStart(3, '0');
  const dIndex = i % 4;
  return {
    id: `EMP-${idStr}`,
    name,
    email: `${name.split(' ')[0].toLowerCase()}@peoplepay.in`,
    phone: `+91 98765${String(43210 + i).slice(-5)}`,
    departmentId: `DEP-00${dIndex + 1}`,
    jobId: jobPositions[i % 8].id,
    panNumber: `ABCDE${1234 + i}F`,
    uanNumber: `10090${1234567 + i}`,
    joiningDate: `202${Math.floor(i/5)}-01-15`,
    status: 'Active',
    avatarUrl: null
  };
});

export const contracts = employees.map((emp, i) => ({
  id: `CON-${String(i + 1).padStart(3, '0')}`,
  employeeId: emp.id,
  startDate: emp.joiningDate,
  endDate: null,
  salaryStructureId: i === 21 ? 'STR-003' : 'STR-001',
  baseSalary: 30000 + (i * 5000),
  status: 'Active',
  scheduleId: i % 5 === 0 ? 'SCH-002' : 'SCH-001'
}));
contracts.push({
  id: 'CON-023', employeeId: 'EMP-001', startDate: '2020-01-01', endDate: '2021-12-31', 
  salaryStructureId: 'STR-001', baseSalary: 25000, status: 'Expired', scheduleId: 'SCH-001'
});
contracts.push({
  id: 'CON-024', employeeId: 'EMP-002', startDate: '2019-01-01', endDate: '2022-12-31', 
  salaryStructureId: 'STR-001', baseSalary: 28000, status: 'Expired', scheduleId: 'SCH-001'
});
contracts.push({
  id: 'CON-025', employeeId: 'EMP-004', startDate: '2024-01-01', endDate: null, 
  salaryStructureId: 'STR-002', baseSalary: 120000, status: 'Draft', scheduleId: 'SCH-001'
});

export const timeOffTypes = [
  { id: 'TOT-001', name: 'Annual Leave', code: 'AL', isPaid: true },
  { id: 'TOT-002', name: 'Sick Leave', code: 'SL', isPaid: true },
  { id: 'TOT-003', name: 'Casual Leave', code: 'CL', isPaid: true },
  { id: 'TOT-004', name: 'Maternity Leave', code: 'ML', isPaid: true }
];

export const leaveAllocations = employees.map((emp, i) => ({
  id: `ALL-${String(i + 1).padStart(3, '0')}`,
  employeeId: emp.id,
  timeOffTypeId: 'TOT-001',
  validFrom: '2024-01-01',
  validTo: '2024-12-31',
  totalDays: 20,
  usedDays: Math.floor(Math.random() * 15)
}));

export const leaveRequests = [
  { id: 'LR-001', employeeId: 'EMP-001', timeOffTypeId: 'TOT-001', startDate: '2024-08-10', endDate: '2024-08-14', status: 'Approved', days: 5 },
  { id: 'LR-002', employeeId: 'EMP-002', timeOffTypeId: 'TOT-002', startDate: '2024-08-12', endDate: '2024-08-12', status: 'Approved', days: 1 },
  { id: 'LR-003', employeeId: 'EMP-003', timeOffTypeId: 'TOT-003', startDate: '2024-09-01', endDate: '2024-09-02', status: 'Submitted', days: 2 },
  { id: 'LR-004', employeeId: 'EMP-004', timeOffTypeId: 'TOT-001', startDate: '2024-10-15', endDate: '2024-10-20', status: 'Draft', days: 5 },
  { id: 'LR-005', employeeId: 'EMP-005', timeOffTypeId: 'TOT-001', startDate: '2024-07-01', endDate: '2024-07-05', status: 'Refused', days: 5 }
];

export const attendance = [];
for (let i = 1; i <= 30; i++) {
  attendance.push({ id: `ATT-${i}`, employeeId: employees[i%22].id, date: `2024-08-${String((i%28)+1).padStart(2,'0')}`, checkIn: '09:00', checkOut: '18:00', status: i%5===0?'Late':(i%7===0?'Absent':'Present'), workedHours: 9 });
}
attendance.push({ id: 'ATT-31', employeeId: 'EMP-001', date: '2024-08-20', checkIn: '09:00', checkOut: '20:00', status: 'Overtime', workedHours: 11 });
attendance.push({ id: 'ATT-32', employeeId: 'EMP-002', date: '2024-08-21', checkIn: '09:00', checkOut: null, status: 'Missing Checkout', workedHours: 0 });

export const salaryStructures = [
  { id: 'STR-001', name: 'Standard Indian Payroll', code: 'SIP' },
  { id: 'STR-002', name: 'Executive Payroll', code: 'EXP' },
  { id: 'STR-003', name: 'Circular Error Structure', code: 'ERR' }
];

export const salaryRules = [
  { id: 'RUL-001', structureId: 'STR-001', name: 'Basic Salary', code: 'BASIC', category: 'EARNING', type: 'Formula', formula: 'GROSS * 0.5', sequence: 10 },
  { id: 'RUL-002', structureId: 'STR-001', name: 'House Rent Allowance', code: 'HRA', category: 'EARNING', type: 'Formula', formula: 'BASIC * 0.4', sequence: 20 },
  { id: 'RUL-003', structureId: 'STR-001', name: 'Special Allowance', code: 'SPA', category: 'EARNING', type: 'Formula', formula: 'GROSS - BASIC - HRA', sequence: 30 },
  { id: 'RUL-004', structureId: 'STR-001', name: 'Provident Fund', code: 'PF', category: 'DEDUCTION', type: 'Formula', formula: 'BASIC * 0.12', sequence: 40 },
  { id: 'RUL-005', structureId: 'STR-001', name: 'Professional Tax', code: 'PT', category: 'DEDUCTION', type: 'Fixed', amount: 200, sequence: 50 },
  { id: 'RUL-006', structureId: 'STR-001', name: 'Net Salary', code: 'NET', category: 'NET', type: 'Formula', formula: 'BASIC + HRA + SPA - PF - PT', sequence: 100 },
  
  { id: 'RUL-007', structureId: 'STR-002', name: 'Basic Salary', code: 'BASIC', category: 'EARNING', type: 'Formula', formula: 'GROSS * 0.4', sequence: 10 },
  { id: 'RUL-008', structureId: 'STR-002', name: 'HRA', code: 'HRA', category: 'EARNING', type: 'Formula', formula: 'BASIC * 0.5', sequence: 20 },
  { id: 'RUL-009', structureId: 'STR-002', name: 'LTA', code: 'LTA', category: 'EARNING', type: 'Formula', formula: 'GROSS * 0.1', sequence: 30 },
  { id: 'RUL-010', structureId: 'STR-002', name: 'Special Allowance', code: 'SPA', category: 'EARNING', type: 'Formula', formula: 'GROSS - BASIC - HRA - LTA', sequence: 40 },
  { id: 'RUL-011', structureId: 'STR-002', name: 'PF', code: 'PF', category: 'DEDUCTION', type: 'Formula', formula: 'BASIC * 0.12', sequence: 50 },
  { id: 'RUL-012', structureId: 'STR-002', name: 'Net Salary', code: 'NET', category: 'NET', type: 'Formula', formula: 'BASIC + HRA + LTA + SPA - PF', sequence: 100 },
  
  // Circular dependency for demo
  { id: 'RUL-013', structureId: 'STR-003', name: 'Gross Salary', code: 'GROSS', category: 'EARNING', type: 'Formula', formula: 'BASIC + HRA', sequence: 10 },
  { id: 'RUL-014', structureId: 'STR-003', name: 'Basic', code: 'BASIC', category: 'EARNING', type: 'Formula', formula: 'GROSS * 0.5', sequence: 20 },
  { id: 'RUL-015', structureId: 'STR-003', name: 'HRA', code: 'HRA', category: 'EARNING', type: 'Formula', formula: 'GROSS * 0.4', sequence: 30 }
];

export const payruns = [
  { id: 'PR-001', name: 'July 2024 Payroll', periodStart: '2024-07-01', periodEnd: '2024-07-31', status: 'Paid', paymentDate: '2024-07-31', employeeCount: 21, totalGross: 1250000, totalNet: 1100000 },
  { id: 'PR-002', name: 'August 2024 Payroll', periodStart: '2024-08-01', periodEnd: '2024-08-31', status: 'Validated', paymentDate: '2024-08-31', employeeCount: 22, totalGross: 1300000, totalNet: 1150000 },
  { id: 'PR-003', name: 'September 2024 Payroll', periodStart: '2024-09-01', periodEnd: '2024-09-30', status: 'Draft', paymentDate: null, employeeCount: 22, totalGross: 1300000, totalNet: 1150000 }
];

export const payslips = [];
export const payslipLines = [];
let lineId = 1;

payruns.forEach((pr, prIdx) => {
  employees.forEach((emp, empIdx) => {
    if (prIdx === 0 && empIdx === 21) return; // one joined late
    
    const psId = `PS-${pr.id}-${emp.id}`;
    const base = 30000 + (empIdx * 5000);
    payslips.push({
      id: psId, payrunId: pr.id, employeeId: emp.id, 
      periodStart: pr.periodStart, periodEnd: pr.periodEnd, 
      status: pr.status === 'Paid' ? 'Paid' : (pr.status === 'Validated' ? 'Validated' : 'Draft'),
      grossPay: base, netPay: base * 0.85
    });
    
    payslipLines.push({ id: `PSL-${lineId++}`, payslipId: psId, ruleId: 'RUL-001', name: 'Basic Salary', category: 'EARNING', amount: base * 0.5 });
    payslipLines.push({ id: `PSL-${lineId++}`, payslipId: psId, ruleId: 'RUL-002', name: 'House Rent Allowance', category: 'EARNING', amount: base * 0.2 });
    payslipLines.push({ id: `PSL-${lineId++}`, payslipId: psId, ruleId: 'RUL-003', name: 'Special Allowance', category: 'EARNING', amount: base * 0.3 });
    payslipLines.push({ id: `PSL-${lineId++}`, payslipId: psId, ruleId: 'RUL-004', name: 'Provident Fund', category: 'DEDUCTION', amount: base * 0.06 });
    payslipLines.push({ id: `PSL-${lineId++}`, payslipId: psId, ruleId: 'RUL-005', name: 'Professional Tax', category: 'DEDUCTION', amount: 200 });
  });
});

export const users = [
  { id: 'USR-001', username: 'admin@peoplepay.in', role: 'admin', employeeId: 'EMP-001' },
  { id: 'USR-002', username: 'hr_manager@peoplepay.in', role: 'hr_manager', employeeId: 'EMP-006' },
  { id: 'USR-003', username: 'payroll_manager@peoplepay.in', role: 'hr_payroll_manager', employeeId: 'EMP-008' },
  { id: 'USR-004', username: 'payroll_user@peoplepay.in', role: 'hr_payroll_user', employeeId: 'EMP-007' },
  { id: 'USR-005', username: 'employee1@peoplepay.in', role: 'employee', employeeId: 'EMP-002' },
  { id: 'USR-006', username: 'employee2@peoplepay.in', role: 'employee', employeeId: 'EMP-003' }
];

export const simulationScenarios = [
  { id: 'SIM-001', name: '10% Hike Across Board', date: '2024-10-01' },
  { id: 'SIM-002', name: 'New Tax Regime Switch', date: '2024-04-01' }
];

export const payrollWarnings = [
  { id: 'WARN-001', message: 'Missing PAN for 2 employees', type: 'Compliance' },
  { id: 'WARN-002', message: 'PF contribution exceeds limit for 1 employee', type: 'Limit' },
  { id: 'WARN-003', message: 'Attendance records missing for 5 employees', type: 'Data' },
  { id: 'WARN-004', message: 'Leaves pending approval in current period', type: 'Workflow' },
  { id: 'WARN-005', message: 'Contract expiring in 30 days (EMP-024)', type: 'Data' }
];

export const payrollAnomalies = [
  { id: 'ANOM-001', employeeId: 'EMP-015', issue: 'Net pay is negative after deductions', severity: 'High' },
  { id: 'ANOM-002', employeeId: 'EMP-021', issue: 'Circular dependency detected in salary rules (GROSS -> BASIC -> GROSS)', severity: 'Critical' },
  { id: 'ANOM-003', employeeId: 'EMP-005', issue: 'Unusual spike in overtime hours (>40hrs)', severity: 'Medium' },
  { id: 'ANOM-004', employeeId: 'EMP-008', issue: 'Tax deduction drop > 50% compared to last month', severity: 'Medium' }
];

export const complianceData = {
  pfRegistration: 'DL/CPM/1234567',
  esiRegistration: '10000000000000001',
  ptStates: ['Karnataka', 'Maharashtra', 'Telangana'],
  lastFilingDate: '2024-08-15'
};

// Helper Functions
export const getEmployeeById = (id) => employees.find(e => e.id === id);
export const getContractsByEmployeeId = (id) => contracts.filter(c => c.employeeId === id);
export const getActiveContract = (employeeId) => contracts.find(c => c.employeeId === employeeId && c.status === 'Active');
export const getAttendanceByEmployeeId = (id, dateFrom, dateTo) => attendance.filter(a => a.employeeId === id && (!dateFrom || a.date >= dateFrom) && (!dateTo || a.date <= dateTo));
export const getLeaveRequestsByEmployeeId = (id) => leaveRequests.filter(l => l.employeeId === id);
export const getLeaveAllocationsByEmployeeId = (id) => leaveAllocations.filter(l => l.employeeId === id);
export const getPayslipsByPayrunId = (payrunId) => payslips.filter(p => p.payrunId === payrunId);
export const getPayslipsByEmployeeId = (employeeId) => payslips.filter(p => p.employeeId === employeeId);
export const getPayslipLines = (payslipId) => payslipLines.filter(pl => pl.payslipId === payslipId);
export const getRulesByStructureId = (structureId) => salaryRules.filter(sr => sr.structureId === structureId);

export const getDashboardKPIs = (period, departmentId) => {
  return {
    totalEmployees: employees.length,
    activeContracts: contracts.filter(c => c.status === 'Active').length,
    totalPayrollCost: payruns.reduce((acc, pr) => acc + pr.totalGross, 0),
    avgAttendance: 92.5
  };
};

export const getDashboardCharts = (type, period) => {
  return [
    { name: 'Jan', value: 1000000 },
    { name: 'Feb', value: 1050000 },
    { name: 'Mar', value: 1100000 }
  ];
};

export const computeAggregations = () => {
  return {
    totalEmployees: employees.length,
    totalDepartments: departments.length,
    pendingLeaveRequests: leaveRequests.filter(l => l.status === 'Submitted').length,
    draftPayruns: payruns.filter(p => p.status === 'Draft').length,
    payrollAnomaliesCount: payrollAnomalies.length
  };
};

export default {
  departments, jobPositions, workingSchedules, employees, contracts, 
  timeOffTypes, leaveAllocations, leaveRequests, attendance, 
  salaryStructures, salaryRules, payruns, payslips, payslipLines, 
  users, simulationScenarios, payrollWarnings, payrollAnomalies, complianceData,
  getEmployeeById, getContractsByEmployeeId, getActiveContract, 
  getAttendanceByEmployeeId, getLeaveRequestsByEmployeeId, getLeaveAllocationsByEmployeeId, 
  getPayslipsByPayrunId, getPayslipsByEmployeeId, getPayslipLines, getRulesByStructureId,
  getDashboardKPIs, getDashboardCharts, computeAggregations
};
