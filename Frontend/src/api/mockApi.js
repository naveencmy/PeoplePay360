import * as initialMockData from '../lib/mockData.js';

// We create a mutable local copy of the mock data to simulate state persistence in memory
let db = {
  employees: [],
  contracts: [],
  schedules: [],
  workingSchedules: [],
  attendance: [],
  leaveRequests: [],
  leaveAllocations: [],
  timeOffTypes: [],
  salaryStructures: [],
  salaryRules: [],
  payruns: [],
  payslips: [],
  users: [],
  ...initialMockData // override with anything from mockData
};

if ((!db.schedules || db.schedules.length === 0) && db.workingSchedules?.length) {
  db.schedules = [...db.workingSchedules];
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const randomDelay = () => delay(Math.floor(Math.random() * 300) + 300);

const generateId = () => Math.random().toString(36).substr(2, 9);

export const login = async (email, password) => {
  await randomDelay();
  if (email === 'admin@peoplepay360.com' && password === 'admin') {
    return { token: 'mock-jwt-token', user: { id: 'u1', name: 'Admin', roles: ['admin'] } };
  }
  throw new Error('Invalid credentials');
};

export const refreshToken = async (token) => {
  await randomDelay();
  return { token: 'new-mock-jwt-token' };
};

const enrichEmployee = (emp) => {
  if (!emp) return emp;
  const dept = db.departments?.find(d => d.id === (emp.departmentId || emp.department_id));
  const job = db.jobPositions?.find(j => j.id === (emp.jobId || emp.job_id));
  return {
    ...emp,
    department: emp.department || dept?.name || 'Engineering',
    jobPosition: emp.jobPosition || job?.title || 'Software Engineer',
    workEmail: emp.workEmail || emp.email || '',
    employeeId: emp.employeeId || emp.id,
    status: emp.status || 'Active',
    timeOffCount: db.leaveRequests?.filter(l => (l.employeeId === emp.id || l.employee_id === emp.id)).length || 0,
    contractsCount: db.contracts?.filter(c => (c.employeeId === emp.id || c.employee_id === emp.id)).length || 0,
    attendanceCount: db.attendance?.filter(a => (a.employeeId === emp.id || a.employee_id === emp.id)).length || 0,
  };
};

// Employees
export const getEmployees = async (filters = {}) => {
  await randomDelay();
  let result = db.employees.map(enrichEmployee);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(e => (e.name && e.name.toLowerCase().includes(q)) || (e.email && e.email.toLowerCase().includes(q)));
  }
  if (filters.department && filters.department !== 'All') {
    result = result.filter(e => e.department === filters.department || e.departmentId === filters.department);
  }
  result.data = result;
  result.total = result.length;
  return result;
};

export const getEmployee = async (id) => {
  await randomDelay();
  const emp = db.employees.find(e => e.id === id);
  if (!emp) throw new Error('Not found');
  return enrichEmployee(emp);
};

export const createEmployee = async (data) => {
  await randomDelay();
  const newEmp = { id: generateId(), ...data };
  db.employees.push(newEmp);
  return newEmp;
};

export const updateEmployee = async (id, data) => {
  await randomDelay();
  const index = db.employees.findIndex(e => e.id === id);
  if (index === -1) throw new Error('Not found');
  db.employees[index] = { ...db.employees[index], ...data };
  return db.employees[index];
};

export const deleteEmployee = async (id) => {
  await randomDelay();
  db.employees = db.employees.filter(e => e.id !== id);
  return { success: true };
};

export const getEmployeeSmartCounts = async (id) => {
  await randomDelay();
  return {
    contracts: db.contracts.filter(c => (c.employee_id === id || c.employeeId === id)).length,
    attendance: db.attendance.filter(a => (a.employee_id === id || a.employeeId === id)).length,
    timeoff: db.leaveRequests.filter(l => (l.employee_id === id || l.employeeId === id)).length,
  };
};

// Contracts
export const getContracts = async (filters = {}) => {
  await randomDelay();
  let result = db.contracts.map(c => {
    const emp = db.employees.find(e => e.id === (c.employeeId || c.employee_id));
    const struct = db.salaryStructures?.find(s => s.id === (c.salaryStructureId || c.salary_structure_id));
    return {
      ...c,
      reference: c.reference || c.id,
      employeeName: c.employeeName || emp?.name || 'Unknown Employee',
      wage: c.wage !== undefined ? c.wage : (c.baseSalary || 0),
      salaryStructure: c.salaryStructure || struct?.name || 'Standard Structure',
      status: c.status || 'Active'
    };
  });
  if (filters.employee_id || filters.employeeId) {
    const eid = filters.employee_id || filters.employeeId;
    result = result.filter(c => (c.employee_id === eid || c.employeeId === eid));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(c => 
      (c.employeeName && c.employeeName.toLowerCase().includes(q)) || 
      (c.reference && c.reference.toLowerCase().includes(q))
    );
  }
  if (filters.status && filters.status !== 'All') {
    result = result.filter(c => c.status === filters.status);
  }
  if (filters.active !== undefined) {
    result = result.filter(c => c.active === filters.active || c.status === 'Active');
  }
  result.data = result;
  result.total = result.length;
  return result;
};

export const getContract = async (id) => {
  await randomDelay();
  return db.contracts.find(c => c.id === id);
};

export const createContract = async (data) => {
  await randomDelay();
  if (data.active) {
    const activeExists = db.contracts.some(c => c.employee_id === data.employee_id && c.active);
    if (activeExists) throw new Error('Overlapping active contract exists');
  }
  const newContract = { id: generateId(), ...data };
  db.contracts.push(newContract);
  return newContract;
};

export const updateContract = async (id, data) => {
  await randomDelay();
  const index = db.contracts.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Not found');
  db.contracts[index] = { ...db.contracts[index], ...data };
  return db.contracts[index];
};

// Working Schedules
export const getSchedules = async () => {
  await randomDelay();
  const source = (db.schedules?.length ? db.schedules : db.workingSchedules) || [];
  const result = source.map(s => ({
    ...s,
    daysPerWeek: s.daysPerWeek || (s.lines ? s.lines.filter(l => l.type === 'Work').length : 5),
    hoursPerWeek: s.hoursPerWeek || 40,
    status: s.status || 'Active',
    company: s.company || 'PeoplePay360'
  }));
  result.data = result;
  result.total = result.length;
  return result;
};

export const getSchedule = async (id) => {
  await randomDelay();
  const source = (db.schedules?.length ? db.schedules : db.workingSchedules) || [];
  return source.find(s => s.id === id);
};

export const createSchedule = async (data) => {
  await randomDelay();
  const newSchedule = { id: generateId(), ...data };
  db.schedules.push(newSchedule);
  return newSchedule;
};

export const updateSchedule = async (id, data) => {
  await randomDelay();
  const index = db.schedules.findIndex(s => s.id === id);
  db.schedules[index] = { ...db.schedules[index], ...data };
  return db.schedules[index];
};

// Attendance
export const getAttendance = async (filters = {}) => {
  await randomDelay();
  let result = db.attendance.map(a => {
    const emp = db.employees.find(e => e.id === (a.employeeId || a.employee_id));
    return {
      ...a,
      employeeName: a.employeeName || emp?.name || 'Unknown Employee',
      employeeAvatar: a.employeeAvatar || emp?.avatarUrl || null,
      status: a.status || 'Present',
      date: a.date || '2024-08-01'
    };
  });
  if (filters.employee_id || filters.employeeId) {
    const eid = filters.employee_id || filters.employeeId;
    result = result.filter(a => a.employee_id === eid || a.employeeId === eid);
  }
  if (filters.employeeSearch) {
    const q = filters.employeeSearch.toLowerCase();
    result = result.filter(a => 
      (a.employeeName && a.employeeName.toLowerCase().includes(q)) || 
      (a.employeeId && a.employeeId.toLowerCase().includes(q))
    );
  }
  if (filters.status && filters.status !== 'All') {
    result = result.filter(a => a.status === filters.status);
  }
  result.data = result;
  result.total = result.length;
  return result;
};

export const updateAttendance = async (data) => {
  await randomDelay();
  const index = db.attendance.findIndex(a => a.id === data.id);
  if (index === -1) throw new Error('Not found');
  db.attendance[index] = { ...db.attendance[index], ...data };
  return db.attendance[index];
};

export const checkin = async (employeeId) => {
  await randomDelay();
  const record = { id: generateId(), employee_id: employeeId, type: 'checkin', timestamp: new Date().toISOString() };
  db.attendance.push(record);
  return record;
};

export const checkout = async (employeeId) => {
  await randomDelay();
  const record = { id: generateId(), employee_id: employeeId, type: 'checkout', timestamp: new Date().toISOString() };
  db.attendance.push(record);
  return record;
};

// Time Off
export const getLeaveRequests = async (filters = {}) => {
  await randomDelay();
  let result = db.leaveRequests.map(l => {
    const emp = db.employees.find(e => e.id === (l.employeeId || l.employee_id));
    const type = db.timeOffTypes.find(t => t.id === (l.timeOffTypeId || l.time_off_type_id));
    return {
      ...l,
      employeeName: l.employeeName || emp?.name || 'Unknown Employee',
      employeeAvatar: l.employeeAvatar || emp?.avatarUrl || null,
      typeName: l.typeName || type?.name || 'Annual Leave',
      status: l.status || 'Pending',
      startDate: l.startDate || '2024-08-10',
      endDate: l.endDate || '2024-08-14',
      days: l.days || 1
    };
  });
  if (filters.employee_id || filters.employeeId) {
    const eid = filters.employee_id || filters.employeeId;
    result = result.filter(l => l.employee_id === eid || l.employeeId === eid);
  }
  if (filters.employee) {
    const q = filters.employee.toLowerCase();
    result = result.filter(l => l.employeeName.toLowerCase().includes(q));
  }
  if (filters.status && filters.status !== 'All') {
    result = result.filter(l => l.status.toLowerCase() === filters.status.toLowerCase());
  }
  result.data = result;
  result.total = result.length;
  return result;
};

export const createLeaveRequest = async (data) => {
  await randomDelay();
  const req = { id: generateId(), status: 'pending', ...data };
  db.leaveRequests.push(req);
  return req;
};

export const approveLeaveRequest = async (id) => {
  await randomDelay();
  const index = db.leaveRequests.findIndex(l => l.id === id);
  db.leaveRequests[index].status = 'approved';
  return db.leaveRequests[index];
};

export const rejectLeaveRequest = async (id) => {
  await randomDelay();
  const index = db.leaveRequests.findIndex(l => l.id === id);
  db.leaveRequests[index].status = 'rejected';
  return db.leaveRequests[index];
};

export const getLeaveAllocations = async (filters = {}) => {
  await randomDelay();
  let result = db.leaveAllocations.map(a => {
    const emp = db.employees.find(e => e.id === (a.employeeId || a.employee_id));
    const type = db.timeOffTypes.find(t => t.id === (a.timeOffTypeId || a.time_off_type_id));
    const allocated = a.allocated ?? a.totalDays ?? 20;
    const taken = a.taken ?? a.usedDays ?? 0;
    return {
      ...a,
      employeeName: a.employeeName || emp?.name || 'Unknown Employee',
      type: a.type || type?.name || 'Annual Leave',
      period: a.period || (a.validFrom ? `${a.validFrom.slice(0, 4)} Calendar Year` : '2024 Calendar Year'),
      allocated,
      taken,
      remaining: allocated - taken
    };
  });
  if (filters.employee) {
    const q = filters.employee.toLowerCase();
    result = result.filter(a => a.employeeName.toLowerCase().includes(q));
  }
  result.data = result;
  result.total = result.length;
  return result;
};

export const getTimeOffTypes = async () => {
  await randomDelay();
  return db.timeOffTypes.map(t => ({
    ...t,
    unit: t.unit || 'Days',
    allocationRequired: t.allocationRequired !== undefined ? t.allocationRequired : true,
    approvalRequired: t.approvalRequired !== undefined ? t.approvalRequired : true,
    payrollIntegration: t.payrollIntegration !== undefined ? t.payrollIntegration : true
  }));
};

export const createTimeOffType = async (data) => {
  await randomDelay();
  const type = { id: generateId(), ...data };
  db.timeOffTypes.push(type);
  return type;
};

// Salary
export const getSalaryStructures = async () => {
  await randomDelay();
  return db.salaryStructures.map(s => ({
    ...s,
    rulesCount: db.salaryRules.filter(r => (r.structureId === s.id || r.structure_id === s.id)).length,
    contractsCount: db.contracts.filter(c => (c.salaryStructureId === s.id || c.salary_structure_id === s.id)).length,
    status: s.status || 'Active'
  }));
};

export const createSalaryStructure = async (data) => {
  await randomDelay();
  const struct = { id: generateId(), ...data };
  db.salaryStructures.push(struct);
  return struct;
};

export const getSalaryRules = async (structureId) => {
  await randomDelay();
  const struct = db.salaryStructures.find(s => s.id === structureId);
  return db.salaryRules
    .filter(r => r.structureId === structureId || r.structure_id === structureId)
    .map(r => ({
      ...r,
      structureName: struct?.name || structureId,
      sequence: r.sequence ?? 10,
      type: r.type || 'Formula',
      formula: r.formula || (r.amount ? `₹${r.amount}` : 'GROSS * 0.5')
    }));
};

export const createSalaryRule = async (data) => {
  await randomDelay();
  const rule = { id: generateId(), ...data };
  db.salaryRules.push(rule);
  return rule;
};

export const updateSalaryRule = async (id, data) => {
  await randomDelay();
  const index = db.salaryRules.findIndex(r => r.id === id);
  db.salaryRules[index] = { ...db.salaryRules[index], ...data };
  return db.salaryRules[index];
};

export const validateGraph = async (structureId) => {
  await randomDelay();
  const isCircular = structureId === 'STR-003';
  return { 
    valid: !isCircular, 
    hasCycle: isCircular,
    circular_dependencies: isCircular ? ['GROSS -> BASIC -> HRA -> GROSS'] : [] 
  };
};

// Payruns
export const getPayruns = async (filters = {}) => {
  await randomDelay();
  const result = db.payruns.map(p => ({
    ...p,
    periodName: p.periodName || p.name || 'Payroll Cycle',
    totalAmount: p.totalAmount || (p.totalNet ? ('₹' + p.totalNet.toLocaleString()) : '₹11,00,000'),
    employeeCount: p.employeeCount || 22,
    status: p.status || 'Draft'
  }));
  result.data = result;
  result.total = result.length;
  return result;
};

export const getPayrun = async (id) => {
  await randomDelay();
  const pr = db.payruns.find(p => p.id === id);
  if (!pr) return null;
  return {
    ...pr,
    periodName: pr.periodName || pr.name || 'Payroll Cycle',
    totalGross: pr.totalGross ? ('₹' + pr.totalGross.toLocaleString()) : '₹12,50,000',
    totalDeductions: pr.totalDeductions || '₹1,50,000',
    totalNet: pr.totalNet ? ('₹' + pr.totalNet.toLocaleString()) : '₹11,00,000',
    employeeCount: pr.employeeCount || 22,
    status: pr.status || 'Draft'
  };
};

export const createPayrun = async (data) => {
  await randomDelay();
  const pr = { id: generateId(), status: 'draft', ...data };
  db.payruns.push(pr);
  return pr;
};

export const addEmployeesToPayrun = async (id, employeeIds) => {
  await randomDelay();
  return { success: true };
};

export const computePayrun = async (id) => {
  await randomDelay();
  return { success: true };
};

export const validatePayrun = async (id) => {
  await randomDelay();
  return { anomalies: 0 };
};

export const markPaid = async (id) => {
  await randomDelay();
  const idx = db.payruns.findIndex(p => p.id === id);
  db.payruns[idx].status = 'paid';
  return db.payruns[idx];
};

export const sendPayslips = async (id) => {
  await randomDelay();
  return { success: true };
};

// Payslips
export const getPayslips = async (filters = {}) => {
  await randomDelay();
  let result = db.payslips.map(p => {
    const emp = db.employees.find(e => e.id === (p.employeeId || p.employee_id));
    const pr = db.payruns.find(pr => pr.id === (p.payrunId || p.payrun_id));
    return {
      ...p,
      employeeName: p.employeeName || emp?.name || 'Employee',
      employeeId: p.employeeId || emp?.id || 'EMP-001',
      periodName: p.periodName || pr?.name || 'July 2024',
      structureName: p.structureName || 'Standard Indian Payroll',
      grossPayFormatted: p.grossPay ? ('₹' + p.grossPay.toLocaleString()) : '₹45,000',
      netPayFormatted: p.netPay ? ('₹' + p.netPay.toLocaleString()) : '₹38,250',
      status: p.status || 'Paid'
    };
  });
  if (filters.payrun_id) result = result.filter(p => p.payrun_id === filters.payrun_id || p.payrunId === filters.payrun_id);
  if (filters.employee_id) result = result.filter(p => p.employee_id === filters.employee_id || p.employeeId === filters.employee_id);
  result.data = result;
  result.total = result.length;
  return result;
};

export const getPayslip = async (id) => {
  await randomDelay();
  const ps = db.payslips.find(p => p.id === id);
  const emp = db.employees.find(e => e.id === (ps?.employeeId || ps?.employee_id)) || db.employees[0];
  const pr = db.payruns.find(pr => pr.id === (ps?.payrunId || ps?.payrun_id)) || db.payruns[0];
  return {
    id: id || 'PS-001',
    employeeId: emp?.id || 'EMP-001',
    employeeName: emp?.name || 'Rahul Sharma',
    department: emp?.department || 'Engineering',
    periodName: pr?.name || 'July 2024',
    structureName: 'Standard Indian Payroll',
    status: ps?.status || 'Paid',
    workedDays: 22,
    basicSalary: '₹25,000',
    hra: '₹10,000',
    specialAllowance: '₹15,000',
    totalEarnings: '₹50,000',
    providentFund: '₹3,000',
    professionalTax: '₹200',
    totalDeductions: '₹3,200',
    netPay: '₹46,800',
    bankAccount: '**** 5678'
  };
};

export const generatePayslipPDF = async (id) => {
  await randomDelay();
  return { url: `/pdfs/${id}.pdf` };
};

// Dashboard
export const getDashboardKPIs = async (period, department) => {
  await randomDelay();
  return {
    totalSalary: '₹12,50,000',
    salaryDelta: '+4.2%',
    payslips: '64',
    paidPayslips: '42',
    pendingPayslips: '22',
    avgSalary: '₹48,500',
    timeOffDays: '14 days',
    attendanceHealth: 94,
    presentDays: 28,
    expectedDays: 30,
    totalEmployees: db.employees.length,
    activeContracts: db.contracts.length,
    payrollCost: 1250000,
    leaveRequests: db.leaveRequests.filter(l => l.status === 'pending' || l.status === 'Submitted').length
  };
};

export const getDashboardCharts = async (type, period) => {
  await randomDelay();
  return {
    salaryByDept: [
      { name: 'Engineering', value: 450000 },
      { name: 'Sales', value: 320000 },
      { name: 'HR', value: 180000 },
      { name: 'Finance', value: 300000 },
    ],
    salaryTrend: [
      { month: 'Apr', value: 1120000 },
      { month: 'May', value: 1180000 },
      { month: 'Jun', value: 1200000 },
      { month: 'Jul', value: 1250000 },
      { month: 'Aug', value: 1300000 },
      { month: 'Sep', value: 1300000 },
    ],
    headcountByDept: [
      { name: 'Engineering', value: 10 },
      { name: 'Sales', value: 6 },
      { name: 'HR', value: 3 },
      { name: 'Finance', value: 3 },
    ]
  };
};

// Simulator
export const createSimulation = async (data) => {
  await randomDelay();
  return { id: generateId(), ...data };
};

export const runSimulation = async (id, overrides) => {
  await randomDelay();
  return { result: 'Simulation completed', costDiff: 500 };
};

// Anomalies & Compliance
export const getAnomalies = async (payrunId) => {
  await randomDelay();
  return [
    { 
      type: 'warning', 
      title: 'Salary Variance Detected',
      message: 'Salary changed by 20% compared to last period for 2 employees.' 
    },
    { 
      type: 'error', 
      title: 'Missing Attendance Logs',
      message: 'Attendance logs missing for EMP-002 and EMP-004 in the current period.' 
    }
  ];
};

export const getComplianceReadiness = async (period) => {
  await randomDelay();
  return { ready: true, score: 95 };
};

// Users
export const getUsers = async () => {
  await randomDelay();
  const result = db.users.map(u => {
    const emp = db.employees.find(e => e.id === (u.employeeId || u.employee_id));
    const username = u.username || 'user@peoplepay.in';
    const fallbackName = username.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return {
      ...u,
      name: u.name || emp?.name || fallbackName,
      email: u.email || u.username || 'user@peoplepay.in',
      role: u.role || 'employee',
      linkedEmployee: u.linkedEmployee || emp?.name || 'Not Linked',
      status: u.status || 'Active'
    };
  });
  result.data = result;
  result.total = result.length;
  return result;
};

export const createUser = async (data) => {
  await randomDelay();
  const user = { id: generateId(), ...data };
  db.users.push(user);
  return user;
};

export const updateUser = async (id, data) => {
  await randomDelay();
  const idx = db.users.findIndex(u => u.id === id);
  db.users[idx] = { ...db.users[idx], ...data };
  return db.users[idx];
};
