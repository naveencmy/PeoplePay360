/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPUTATION ENGINE UNIT TESTS
 * Tests the crown jewel: DAG dependency graph, topological sort, 
 * safe formula evaluation, and the full computation pipeline.
 * 15+ test cases covering all edge cases.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const {
  buildDependencyGraph,
  topologicalSort,
  buildContext,
  executeRule,
  evaluateCondition,
  computePayslip,
  getDependencies,
} = require('../../src/services/computation.service');

const { safeEvaluate, validateFormula, extractVariables } = require('../../src/utils/computation.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Test Data: Salary Structures
// ─────────────────────────────────────────────────────────────────────────────

const BASIC_STRUCTURE = [
  {
    id: 'rule-1', code: 'BASIC', name: 'Basic Salary', category: 'BASIC',
    sequence: 1, computation_type: 'FIXED', amount: 50000, active: true,
    appears_on_payslip: true, computation_basis: null, formula: null, condition: null,
  },
  {
    id: 'rule-2', code: 'HRA', name: 'House Rent Allowance', category: 'ALLOWANCE',
    sequence: 2, computation_type: 'PERCENTAGE', computation_basis: 'BASIC',
    amount: 0.5, active: true, appears_on_payslip: true, formula: null, condition: null,
  },
  {
    id: 'rule-3', code: 'DA', name: 'Dearness Allowance', category: 'ALLOWANCE',
    sequence: 3, computation_type: 'PERCENTAGE', computation_basis: 'BASIC',
    amount: 0.1, active: true, appears_on_payslip: true, formula: null, condition: null,
  },
  {
    id: 'rule-4', code: 'GROSS', name: 'Gross Salary', category: 'GROSS',
    sequence: 10, computation_type: 'FORMULA', formula: 'BASIC + HRA + DA',
    active: true, appears_on_payslip: true, computation_basis: null, condition: null, amount: 0,
  },
  {
    id: 'rule-5', code: 'PF', name: 'Provident Fund', category: 'DEDUCTION',
    sequence: 11, computation_type: 'FORMULA', formula: 'min(BASIC * 0.12, 1800)',
    active: true, appears_on_payslip: true, computation_basis: null, condition: null, amount: 0,
  },
  {
    id: 'rule-6', code: 'PT', name: 'Professional Tax', category: 'DEDUCTION',
    sequence: 12, computation_type: 'FIXED', amount: 200,
    active: true, appears_on_payslip: true, computation_basis: null, formula: null, condition: null,
  },
  {
    id: 'rule-7', code: 'NET', name: 'Net Salary', category: 'NET',
    sequence: 20, computation_type: 'FORMULA', formula: 'GROSS - PF - PT',
    active: true, appears_on_payslip: true, computation_basis: null, condition: null, amount: 0,
  },
];

const MOCK_EMPLOYEE = {
  id: 'emp-1', first_name: 'John', last_name: 'Doe',
  department: 'Engineering', designation: 'Senior Engineer',
};

const MOCK_CONTRACT = {
  id: 'contract-1', wage: 50000, wage_type: 'MONTHLY', structure_id: 'struct-1',
};

const MOCK_ATTENDANCE = { worked_days: 22, total_hours: 176 };

// ─────────────────────────────────────────────────────────────────────────────
// Safe Formula Evaluation Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Safe Formula Evaluation', () => {
  test('evaluates basic arithmetic', () => {
    expect(safeEvaluate('2 + 3')).toBe(5);
    expect(safeEvaluate('10 * 5')).toBe(50);
    expect(safeEvaluate('100 / 4')).toBe(25);
    expect(safeEvaluate('50 - 20')).toBe(30);
  });

  test('evaluates with variables', () => {
    expect(safeEvaluate('BASIC * 0.5', { BASIC: 50000 })).toBe(25000);
    expect(safeEvaluate('BASIC + HRA', { BASIC: 50000, HRA: 25000 })).toBe(75000);
  });

  test('evaluates min/max functions', () => {
    expect(safeEvaluate('min(BASIC * 0.12, 1800)', { BASIC: 50000 })).toBe(1800);
    expect(safeEvaluate('min(BASIC * 0.12, 1800)', { BASIC: 10000 })).toBe(1200);
    expect(safeEvaluate('max(1000, 2000)')).toBe(2000);
  });

  test('evaluates round/ceil/floor', () => {
    expect(safeEvaluate('round(3.7)')).toBe(4);
    expect(safeEvaluate('ceil(3.2)')).toBe(4);
    expect(safeEvaluate('floor(3.9)')).toBe(3);
  });

  test('rejects dangerous patterns', () => {
    expect(() => safeEvaluate('process.exit()')).toThrow();
    expect(() => safeEvaluate('require("fs")')).toThrow();
    expect(() => safeEvaluate('eval("1+1")')).toThrow();
    expect(() => safeEvaluate('__proto__')).toThrow();
  });

  test('rejects disallowed functions', () => {
    expect(() => safeEvaluate('exec("ls")')).toThrow();
    expect(() => safeEvaluate('system("cmd")')).toThrow();
  });

  test('handles zero and edge cases', () => {
    expect(safeEvaluate('0 * 50000')).toBe(0);
    expect(safeEvaluate('BASIC * 0', { BASIC: 50000 })).toBe(0);
  });

  test('defaults non-numeric variables to 0', () => {
    expect(safeEvaluate('BASIC + 100', { BASIC: NaN })).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Formula Validation Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Formula Validation', () => {
  test('validates correct formulas', () => {
    const result = validateFormula('BASIC * 0.5', ['BASIC']);
    expect(result.valid).toBe(true);
  });

  test('validates formulas with multiple variables', () => {
    const result = validateFormula('BASIC + HRA + DA', ['BASIC', 'HRA', 'DA']);
    expect(result.valid).toBe(true);
  });

  test('rejects dangerous formulas', () => {
    const result = validateFormula('process.exit()', []);
    expect(result.valid).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Variable Extraction Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Variable Extraction', () => {
  test('extracts variables from formula', () => {
    const vars = extractVariables('BASIC + HRA - PF');
    expect(vars).toContain('BASIC');
    expect(vars).toContain('HRA');
    expect(vars).toContain('PF');
  });

  test('excludes function names', () => {
    const vars = extractVariables('min(BASIC * 0.12, 1800)');
    expect(vars).toContain('BASIC');
    expect(vars).not.toContain('MIN');
  });

  test('handles empty formula', () => {
    expect(extractVariables('')).toEqual([]);
    expect(extractVariables(null)).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Dependency Graph & Topological Sort Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Dependency Graph', () => {
  test('builds correct DAG from rules', () => {
    const { adjacency, inDegree } = buildDependencyGraph(BASIC_STRUCTURE);
    
    // BASIC has no dependencies
    expect(inDegree.get('BASIC')).toBe(0);
    
    // HRA depends on BASIC
    expect(inDegree.get('HRA')).toBe(1);
    
    // GROSS depends on BASIC, HRA, DA
    expect(inDegree.get('GROSS')).toBe(3);
    
    // NET depends on GROSS, PF, PT
    expect(inDegree.get('NET')).toBe(3);
  });

  test('extracts correct dependencies', () => {
    const grossRule = BASIC_STRUCTURE.find((r) => r.code === 'GROSS');
    const deps = getDependencies(grossRule, BASIC_STRUCTURE);
    
    expect(deps).toContain('BASIC');
    expect(deps).toContain('HRA');
    expect(deps).toContain('DA');
    expect(deps).not.toContain('GROSS'); // Should not depend on itself
  });
});

describe('Topological Sort', () => {
  test('sorts rules in valid execution order', () => {
    const sorted = topologicalSort(BASIC_STRUCTURE);
    const codes = sorted.map((r) => r.code);
    
    // BASIC must come before HRA, DA
    expect(codes.indexOf('BASIC')).toBeLessThan(codes.indexOf('HRA'));
    expect(codes.indexOf('BASIC')).toBeLessThan(codes.indexOf('DA'));
    
    // HRA, DA must come before GROSS
    expect(codes.indexOf('HRA')).toBeLessThan(codes.indexOf('GROSS'));
    expect(codes.indexOf('DA')).toBeLessThan(codes.indexOf('GROSS'));
    
    // GROSS must come before NET
    expect(codes.indexOf('GROSS')).toBeLessThan(codes.indexOf('NET'));
    
    // PF must come before NET
    expect(codes.indexOf('PF')).toBeLessThan(codes.indexOf('NET'));
  });

  test('detects circular dependencies', () => {
    const cyclicRules = [
      { id: '1', code: 'A', sequence: 1, computation_type: 'PERCENTAGE', computation_basis: 'B', amount: 0.5, active: true },
      { id: '2', code: 'B', sequence: 2, computation_type: 'PERCENTAGE', computation_basis: 'A', amount: 0.5, active: true },
    ];
    
    expect(() => topologicalSort(cyclicRules)).toThrow(/Circular dependency/);
  });

  test('handles empty rules', () => {
    expect(topologicalSort([])).toEqual([]);
  });

  test('handles single rule', () => {
    const singleRule = [{
      id: '1', code: 'BASIC', sequence: 1, computation_type: 'FIXED',
      amount: 50000, active: true, computation_basis: null, formula: null, condition: null,
    }];
    
    const sorted = topologicalSort(singleRule);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].code).toBe('BASIC');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Condition Evaluation Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Condition Evaluation', () => {
  const context = {
    contract: { wage: 50000 },
    attendance: { worked_days: 22, total_days: 26 },
    timeoff: { approved_days: 2 },
    rules: { BASIC: 50000, GROSS: 80000 },
  };

  test('evaluates simple comparisons', () => {
    expect(evaluateCondition('contract.wage > 0', context)).toBe(true);
    expect(evaluateCondition('contract.wage > 100000', context)).toBe(false);
    expect(evaluateCondition('contract.wage >= 50000', context)).toBe(true);
    expect(evaluateCondition('contract.wage == 50000', context)).toBe(true);
  });

  test('evaluates rule references', () => {
    expect(evaluateCondition('BASIC > 0', context)).toBe(true);
    expect(evaluateCondition('GROSS > 50000', context)).toBe(true);
  });

  test('defaults to true for unparseable conditions', () => {
    expect(evaluateCondition('some_weird_condition', context)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Rule Execution Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Rule Execution', () => {
  test('executes FIXED rule', () => {
    const context = buildContext(MOCK_EMPLOYEE, MOCK_CONTRACT, MOCK_ATTENDANCE, 0, '2026-09-01', '2026-09-30');
    const rule = BASIC_STRUCTURE.find((r) => r.code === 'BASIC');
    
    const result = executeRule(rule, context);
    expect(result).toBeGreaterThan(0);
    // Pro-rated: 50000 * (worked_days / total_working_days)
  });

  test('executes PERCENTAGE rule', () => {
    const context = buildContext(MOCK_EMPLOYEE, MOCK_CONTRACT, MOCK_ATTENDANCE, 0, '2026-09-01', '2026-09-30');
    context.rules.BASIC = 50000;
    context.variables.BASIC = 50000;
    
    const rule = BASIC_STRUCTURE.find((r) => r.code === 'HRA');
    const result = executeRule(rule, context);
    
    expect(result).toBe(25000); // 50% of BASIC
  });

  test('executes FORMULA rule', () => {
    const context = buildContext(MOCK_EMPLOYEE, MOCK_CONTRACT, MOCK_ATTENDANCE, 0, '2026-09-01', '2026-09-30');
    context.rules.BASIC = 50000;
    context.rules.HRA = 25000;
    context.rules.DA = 5000;
    context.variables = { ...context.rules };
    
    const rule = BASIC_STRUCTURE.find((r) => r.code === 'GROSS');
    const result = executeRule(rule, context);
    
    expect(result).toBe(80000); // BASIC + HRA + DA
  });

  test('respects conditions (skips when false)', () => {
    const context = buildContext(MOCK_EMPLOYEE, { ...MOCK_CONTRACT, wage: 0 }, MOCK_ATTENDANCE, 0, '2026-09-01', '2026-09-30');
    
    const ruleWithCondition = {
      ...BASIC_STRUCTURE[0],
      condition: 'contract.wage > 0',
      computation_type: 'FIXED',
      amount: 50000,
    };
    
    const result = executeRule(ruleWithCondition, context);
    expect(result).toBe(0); // Condition failed, so 0
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Full Computation Pipeline Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Full Computation Pipeline', () => {
  test('computes a complete payslip with basic structure', () => {
    const result = computePayslip({
      employee: MOCK_EMPLOYEE,
      contract: MOCK_CONTRACT,
      attendance: MOCK_ATTENDANCE,
      timeoffDays: 0,
      rules: BASIC_STRUCTURE,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    });

    expect(result).toHaveProperty('lines');
    expect(result).toHaveProperty('gross');
    expect(result).toHaveProperty('total_deductions');
    expect(result).toHaveProperty('net');
    expect(result).toHaveProperty('worked_days');
    expect(result).toHaveProperty('total_days');

    // Gross should be positive
    expect(result.gross).toBeGreaterThan(0);
    
    // Net should be positive (gross - deductions)
    expect(result.net).toBeGreaterThan(0);
    
    // Net should be less than gross (deductions exist)
    expect(result.net).toBeLessThan(result.gross);
    
    // Total deductions should be positive
    expect(result.total_deductions).toBeGreaterThan(0);
    
    // Lines should have entries for each visible rule
    expect(result.lines.length).toBeGreaterThanOrEqual(5);
  });

  test('pro-rates salary based on attendance', () => {
    // Full attendance
    const fullResult = computePayslip({
      employee: MOCK_EMPLOYEE,
      contract: MOCK_CONTRACT,
      attendance: { worked_days: 22, total_hours: 176 },
      timeoffDays: 0,
      rules: BASIC_STRUCTURE,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    });

    // Half attendance
    const halfResult = computePayslip({
      employee: MOCK_EMPLOYEE,
      contract: MOCK_CONTRACT,
      attendance: { worked_days: 11, total_hours: 88 },
      timeoffDays: 0,
      rules: BASIC_STRUCTURE,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    });

    // Half attendance should result in roughly half the salary
    expect(halfResult.gross).toBeLessThan(fullResult.gross);
  });

  test('handles approved time off as worked days', () => {
    // With 2 days time off
    const withTimeOff = computePayslip({
      employee: MOCK_EMPLOYEE,
      contract: MOCK_CONTRACT,
      attendance: { worked_days: 20, total_hours: 160 },
      timeoffDays: 2,
      rules: BASIC_STRUCTURE,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    });

    // Without time off (but same base attendance)
    const withoutTimeOff = computePayslip({
      employee: MOCK_EMPLOYEE,
      contract: MOCK_CONTRACT,
      attendance: { worked_days: 20, total_hours: 160 },
      timeoffDays: 0,
      rules: BASIC_STRUCTURE,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    });

    // With time off should have higher salary (time off counts as worked)
    expect(withTimeOff.gross).toBeGreaterThanOrEqual(withoutTimeOff.gross);
  });

  test('computation_log records all rule results', () => {
    const result = computePayslip({
      employee: MOCK_EMPLOYEE,
      contract: MOCK_CONTRACT,
      attendance: MOCK_ATTENDANCE,
      timeoffDays: 0,
      rules: BASIC_STRUCTURE,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    });

    expect(result.computation_log).toBeDefined();
    expect(result.computation_log.length).toBe(BASIC_STRUCTURE.length);
    
    const codes = result.computation_log.map((l) => l.code);
    expect(codes).toContain('BASIC');
    expect(codes).toContain('HRA');
    expect(codes).toContain('GROSS');
    expect(codes).toContain('NET');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge Case Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Edge Cases', () => {
  test('handles complex formula with min()', () => {
    const pfRule = BASIC_STRUCTURE.find((r) => r.code === 'PF');
    const context = buildContext(MOCK_EMPLOYEE, MOCK_CONTRACT, MOCK_ATTENDANCE, 0, '2026-09-01', '2026-09-30');
    context.rules.BASIC = 50000;
    context.variables.BASIC = 50000;
    
    const result = executeRule(pfRule, context);
    
    // min(50000 * 0.12, 1800) = min(6000, 1800) = 1800
    expect(result).toBe(1800);
  });

  test('handles zero wage contract', () => {
    const result = computePayslip({
      employee: MOCK_EMPLOYEE,
      contract: { ...MOCK_CONTRACT, wage: 0 },
      attendance: MOCK_ATTENDANCE,
      timeoffDays: 0,
      rules: [BASIC_STRUCTURE[0]], // Just BASIC
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    });

    // Zero wage should still compute (FIXED rule ignores wage)
    expect(result).toHaveProperty('gross');
  });

  test('handles structure with only deductions', () => {
    const deductionOnly = [{
      id: 'rule-1', code: 'PT', name: 'Professional Tax', category: 'DEDUCTION',
      sequence: 1, computation_type: 'FIXED', amount: 200, active: true,
      appears_on_payslip: true, computation_basis: null, formula: null, condition: null,
    }];

    // This should throw because net would be negative
    expect(() => computePayslip({
      employee: MOCK_EMPLOYEE,
      contract: MOCK_CONTRACT,
      attendance: MOCK_ATTENDANCE,
      timeoffDays: 0,
      rules: deductionOnly,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    })).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5+ Real-World Rule Structures Test Suite (Requirement: 5+ structures tested)
// ─────────────────────────────────────────────────────────────────────────────

describe('5+ Real-World Salary Structures Test Suite', () => {
  // Structure 1: IT & Software Services (Indian Tech standard)
  const IT_SERVICES_STRUCTURE = [
    { id: 'it-1', code: 'BASIC', name: 'Basic Salary', category: 'BASIC', sequence: 1, computation_type: 'PERCENTAGE', computation_basis: 'WAGE', amount: 0.40, active: true, appears_on_payslip: true },
    { id: 'it-2', code: 'HRA', name: 'House Rent Allowance', category: 'ALLOWANCE', sequence: 2, computation_type: 'PERCENTAGE', computation_basis: 'BASIC', amount: 0.50, active: true, appears_on_payslip: true },
    { id: 'it-3', code: 'SPECIAL', name: 'Special Allowance', category: 'ALLOWANCE', sequence: 3, computation_type: 'FORMULA', formula: 'WAGE - (BASIC + HRA)', active: true, appears_on_payslip: true, amount: 0 },
    { id: 'it-4', code: 'MEDICAL', name: 'Medical Allowance', category: 'ALLOWANCE', sequence: 4, computation_type: 'FIXED', amount: 1250, active: true, appears_on_payslip: true },
    { id: 'it-5', code: 'GROSS', name: 'Gross Earnings', category: 'GROSS', sequence: 10, computation_type: 'FORMULA', formula: 'BASIC + HRA + SPECIAL + MEDICAL', active: true, appears_on_payslip: true, amount: 0 },
    { id: 'it-6', code: 'PF', name: 'Provident Fund', category: 'DEDUCTION', sequence: 11, computation_type: 'FORMULA', formula: 'min(BASIC * 0.12, 1800)', active: true, appears_on_payslip: true, amount: 0 },
    { id: 'it-7', code: 'PT', name: 'Professional Tax', category: 'DEDUCTION', sequence: 12, computation_type: 'FIXED', amount: 200, active: true, appears_on_payslip: true },
    { id: 'it-8', code: 'NET', name: 'Net Pay', category: 'NET', sequence: 20, computation_type: 'FORMULA', formula: 'GROSS - PF - PT', active: true, appears_on_payslip: true, amount: 0 },
  ];

  // Structure 2: Executive & Leadership Structure (High compensation, NPS, Gratuity)
  const EXECUTIVE_STRUCTURE = [
    { id: 'exec-1', code: 'BASIC', name: 'Basic Pay', category: 'BASIC', sequence: 1, computation_type: 'PERCENTAGE', computation_basis: 'WAGE', amount: 0.50, active: true, appears_on_payslip: true },
    { id: 'exec-2', code: 'EXEC_ALL', name: 'Executive Allowance', category: 'ALLOWANCE', sequence: 2, computation_type: 'PERCENTAGE', computation_basis: 'WAGE', amount: 0.30, active: true, appears_on_payslip: true },
    { id: 'exec-3', code: 'PERF_BONUS', name: 'Performance Pay', category: 'ALLOWANCE', sequence: 3, computation_type: 'FIXED', amount: 25000, active: true, appears_on_payslip: true },
    { id: 'exec-4', code: 'GROSS', name: 'Gross Pay', category: 'GROSS', sequence: 10, computation_type: 'FORMULA', formula: 'BASIC + EXEC_ALL + PERF_BONUS', active: true, appears_on_payslip: true, amount: 0 },
    { id: 'exec-5', code: 'NPS', name: 'National Pension Scheme', category: 'DEDUCTION', sequence: 11, computation_type: 'FORMULA', formula: 'BASIC * 0.10', active: true, appears_on_payslip: true, amount: 0 },
    { id: 'exec-6', code: 'EXEC_TAX', name: 'Executive Tax Withholding', category: 'DEDUCTION', sequence: 12, computation_type: 'FORMULA', formula: 'GROSS * 0.20', active: true, appears_on_payslip: true, amount: 0 },
    { id: 'exec-7', code: 'NET', name: 'Take Home Net', category: 'NET', sequence: 20, computation_type: 'FORMULA', formula: 'GROSS - NPS - EXEC_TAX', active: true, appears_on_payslip: true, amount: 0 },
  ];

  // Structure 3: Healthcare & Hospital Staff (Hazard, Night Shifts, Indemnity)
  const HEALTHCARE_STRUCTURE = [
    { id: 'hc-1', code: 'BASIC', name: 'Base Pay', category: 'BASIC', sequence: 1, computation_type: 'PERCENTAGE', computation_basis: 'WAGE', amount: 0.45, active: true, appears_on_payslip: true },
    { id: 'hc-2', code: 'NIGHT_SHIFT', name: 'Night Shift Allowance', category: 'ALLOWANCE', sequence: 2, computation_type: 'FIXED', amount: 3500, active: true, appears_on_payslip: true },
    { id: 'hc-3', code: 'HAZARD', name: 'Risk Hazard Pay', category: 'ALLOWANCE', sequence: 3, computation_type: 'PERCENTAGE', computation_basis: 'BASIC', amount: 0.15, active: true, appears_on_payslip: true },
    { id: 'hc-4', code: 'UNIFORM', name: 'Uniform & Laundry', category: 'ALLOWANCE', sequence: 4, computation_type: 'FIXED', amount: 1500, active: true, appears_on_payslip: true },
    { id: 'hc-5', code: 'GROSS', name: 'Total Gross', category: 'GROSS', sequence: 10, computation_type: 'FORMULA', formula: 'BASIC + NIGHT_SHIFT + HAZARD + UNIFORM', active: true, appears_on_payslip: true, amount: 0 },
    { id: 'hc-6', code: 'INDEMNITY', name: 'Professional Indemnity', category: 'DEDUCTION', sequence: 11, computation_type: 'FIXED', amount: 500, active: true, appears_on_payslip: true },
    { id: 'hc-7', code: 'PF', name: 'PF Employee Contribution', category: 'DEDUCTION', sequence: 12, computation_type: 'FORMULA', formula: 'min(BASIC * 0.12, 1800)', active: true, appears_on_payslip: true, amount: 0 },
    { id: 'hc-8', code: 'NET', name: 'Net Earnings', category: 'NET', sequence: 20, computation_type: 'FORMULA', formula: 'GROSS - INDEMNITY - PF', active: true, appears_on_payslip: true, amount: 0 },
  ];

  // Structure 4: Retail & Sales Commission (Retainer, Target Incentive, Welfare)
  const RETAIL_COMMISSION_STRUCTURE = [
    { id: 'ret-1', code: 'RETAINER', name: 'Base Retainer', category: 'BASIC', sequence: 1, computation_type: 'FIXED', amount: 20000, active: true, appears_on_payslip: true },
    { id: 'ret-2', code: 'SALES_INC', name: 'Sales Commission', category: 'ALLOWANCE', sequence: 2, computation_type: 'FIXED', amount: 15000, active: true, appears_on_payslip: true },
    { id: 'ret-3', code: 'STORE_BONUS', name: 'Store Target Bonus', category: 'ALLOWANCE', sequence: 3, computation_type: 'FIXED', amount: 5000, active: true, appears_on_payslip: true },
    { id: 'ret-4', code: 'GROSS', name: 'Gross Salary', category: 'GROSS', sequence: 10, computation_type: 'FORMULA', formula: 'RETAINER + SALES_INC + STORE_BONUS', active: true, appears_on_payslip: true, amount: 0 },
    { id: 'ret-5', code: 'WELFARE', name: 'Staff Welfare Fund', category: 'DEDUCTION', sequence: 11, computation_type: 'FIXED', amount: 300, active: true, appears_on_payslip: true },
    { id: 'ret-6', code: 'RETAIL_PF', name: 'PF Contribution', category: 'DEDUCTION', sequence: 12, computation_type: 'FORMULA', formula: 'RETAINER * 0.12', active: true, appears_on_payslip: true, amount: 0 },
    { id: 'ret-7', code: 'NET', name: 'Net Payable', category: 'NET', sequence: 20, computation_type: 'FORMULA', formula: 'GROSS - WELFARE - RETAIL_PF', active: true, appears_on_payslip: true, amount: 0 },
  ];

  // Structure 5: Manufacturing Plant & Factory Workers (Basic, DA, Shift Bonus, ESI, Union)
  const MANUFACTURING_PLANT_STRUCTURE = [
    { id: 'mfg-1', code: 'BASIC', name: 'Factory Wage', category: 'BASIC', sequence: 1, computation_type: 'FIXED', amount: 16000, active: true, appears_on_payslip: true },
    { id: 'mfg-2', code: 'DA', name: 'Dearness Allowance', category: 'ALLOWANCE', sequence: 2, computation_type: 'FIXED', amount: 4000, active: true, appears_on_payslip: true },
    { id: 'mfg-3', code: 'ATTENDANCE_BONUS', name: 'Attendance Award', category: 'ALLOWANCE', sequence: 3, computation_type: 'FIXED', amount: 1200, active: true, appears_on_payslip: true },
    { id: 'mfg-4', code: 'GROSS', name: 'Gross Production Pay', category: 'GROSS', sequence: 10, computation_type: 'FORMULA', formula: 'BASIC + DA + ATTENDANCE_BONUS', active: true, appears_on_payslip: true, amount: 0 },
    { id: 'mfg-5', code: 'ESI', name: 'ESI Employee Share', category: 'DEDUCTION', sequence: 11, computation_type: 'FORMULA', formula: 'round(GROSS * 0.0075)', active: true, appears_on_payslip: true, amount: 0 },
    { id: 'mfg-6', code: 'UNION_DUES', name: 'Trade Union Subscription', category: 'DEDUCTION', sequence: 12, computation_type: 'FIXED', amount: 150, active: true, appears_on_payslip: true },
    { id: 'mfg-7', code: 'NET', name: 'Net Factory Wage', category: 'NET', sequence: 20, computation_type: 'FORMULA', formula: 'GROSS - ESI - UNION_DUES', active: true, appears_on_payslip: true, amount: 0 },
  ];

  test('Structure 1 (IT Services): computes full pipeline with multi-variable formula and PF cap', () => {
    const result = computePayslip({
      employee: MOCK_EMPLOYEE,
      contract: { id: 'contract-it', wage: 80000, wage_type: 'MONTHLY' },
      attendance: { worked_days: 22, total_hours: 176 },
      timeoffDays: 0,
      rules: IT_SERVICES_STRUCTURE,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    });

    expect(result.gross).toBeGreaterThan(0);
    expect(result.net).toBeGreaterThan(0);
    expect(result.total_deductions).toBe(2000); // PF (1800 cap) + PT (200)
    expect(result.lines.length).toBe(IT_SERVICES_STRUCTURE.length);
  });

  test('Structure 2 (Executive Leadership): handles 6-figure wage with NPS & tax formula', () => {
    const result = computePayslip({
      employee: { ...MOCK_EMPLOYEE, designation: 'VP Engineering' },
      contract: { id: 'contract-exec', wage: 250000, wage_type: 'MONTHLY' },
      attendance: { worked_days: 22, total_hours: 176 },
      timeoffDays: 0,
      rules: EXECUTIVE_STRUCTURE,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    });

    expect(result.gross).toBe(225000); // 125000 + 75000 + 25000
    expect(result.total_deductions).toBe(57500); // NPS (12500) + EXEC_TAX (45000)
    expect(result.net).toBe(167500);
  });

  test('Structure 3 (Healthcare & Hospital): handles risk allowances & indemnity', () => {
    const result = computePayslip({
      employee: { ...MOCK_EMPLOYEE, department: 'ICU Nursing' },
      contract: { id: 'contract-hc', wage: 60000, wage_type: 'MONTHLY' },
      attendance: { worked_days: 22, total_hours: 176 },
      timeoffDays: 0,
      rules: HEALTHCARE_STRUCTURE,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    });

    expect(result.gross).toBeGreaterThan(30000);
    expect(result.net).toBeGreaterThan(0);
    expect(result.lines.find((l) => l.code === 'INDEMNITY').amount).toBe(500);
  });

  test('Structure 4 (Retail & Sales Commission): computes retainer with store targets', () => {
    const result = computePayslip({
      employee: { ...MOCK_EMPLOYEE, department: 'Retail Sales' },
      contract: { id: 'contract-retail', wage: 20000, wage_type: 'MONTHLY' },
      attendance: { worked_days: 22, total_hours: 176 },
      timeoffDays: 0,
      rules: RETAIL_COMMISSION_STRUCTURE,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    });

    expect(result.gross).toBe(40000); // 20000 + 15000 + 5000
    expect(result.total_deductions).toBe(2700); // 300 welfare + 2400 PF
    expect(result.net).toBe(37300);
  });

  test('Structure 5 (Manufacturing Factory): computes statutory ESI rounding and union dues', () => {
    const result = computePayslip({
      employee: { ...MOCK_EMPLOYEE, department: 'Assembly Line' },
      contract: { id: 'contract-mfg', wage: 16000, wage_type: 'MONTHLY' },
      attendance: { worked_days: 22, total_hours: 176 },
      timeoffDays: 0,
      rules: MANUFACTURING_PLANT_STRUCTURE,
      periodStart: '2026-09-01',
      periodEnd: '2026-09-30',
    });

    expect(result.gross).toBe(21200); // 16000 + 4000 + 1200
    expect(result.lines.find((l) => l.code === 'UNION_DUES').amount).toBe(150);
    expect(result.net).toBeLessThan(result.gross);
    expect(result.net).toBeGreaterThan(0);
  });
});
