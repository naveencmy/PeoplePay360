const { safeEvaluate, extractVariables } = require('../utils/computation.utils');
const { roundToPaysa } = require('../utils/currency.utils');
const { getWorkingDays } = require('../utils/date.utils');
const { AppError } = require('../middleware/error.middleware');

// ─────────────────────────────────────────────────────────────────────────────
// ⭐ SALARY COMPUTATION ENGINE — THE CROWN JEWEL
// Implements: DAG dependency graph, topological sort (Kahn's algorithm),
// safe formula evaluation, and the full payslip computation pipeline.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a Directed Acyclic Graph (DAG) from salary rules
 * Each node is a rule, edges represent dependencies
 * 
 * @param {Object[]} rules - Salary rules array
 * @returns {{ adjacency: Map, inDegree: Map, nodeMap: Map }}
 */
function buildDependencyGraph(rules) {
  const adjacency = new Map();  // node → Set of dependent nodes
  const inDegree = new Map();   // node → number of incoming edges
  const nodeMap = new Map();    // code → rule object

  // Initialize all nodes
  for (const rule of rules) {
    adjacency.set(rule.code, new Set());
    inDegree.set(rule.code, 0);
    nodeMap.set(rule.code, rule);
  }

  // Build edges from dependencies
  for (const rule of rules) {
    const deps = getDependencies(rule, rules);
    for (const depCode of deps) {
      if (adjacency.has(depCode)) {
        adjacency.get(depCode).add(rule.code);
        inDegree.set(rule.code, (inDegree.get(rule.code) || 0) + 1);
      }
    }
  }

  return { adjacency, inDegree, nodeMap };
}

/**
 * Extract dependencies for a rule
 * A rule depends on:
 * 1. Its computation_basis (for PERCENTAGE type)
 * 2. Variables referenced in its formula (for FORMULA type)
 * 3. Variables referenced in its condition
 * 
 * @param {Object} rule - Salary rule
 * @param {Object[]} allRules - All rules (for code lookup)
 * @returns {string[]} Array of dependency rule codes
 */
function getDependencies(rule, allRules) {
  const deps = new Set();
  const validCodes = new Set(allRules.map((r) => r.code));

  // PERCENTAGE type depends on its basis
  if (rule.computation_type === 'PERCENTAGE' && rule.computation_basis) {
    if (validCodes.has(rule.computation_basis)) {
      deps.add(rule.computation_basis);
    }
  }

  // FORMULA type depends on variables used in the formula
  if (rule.computation_type === 'FORMULA' && rule.formula) {
    const formulaVars = extractVariables(rule.formula);
    for (const v of formulaVars) {
      if (validCodes.has(v)) {
        deps.add(v);
      }
    }
  }

  // Condition references
  if (rule.condition) {
    const conditionVars = extractVariables(rule.condition);
    for (const v of conditionVars) {
      if (validCodes.has(v)) {
        deps.add(v);
      }
    }
  }

  // A rule cannot depend on itself
  deps.delete(rule.code);

  return [...deps];
}

/**
 * Topological Sort using Kahn's Algorithm
 * Detects cycles and returns rules in dependency order
 * 
 * @param {Object[]} rules - Salary rules array
 * @returns {Object[]} Topologically sorted rules
 * @throws {Error} If circular dependency is detected
 */
function topologicalSort(rules) {
  if (rules.length === 0) return [];

  const { adjacency, inDegree, nodeMap } = buildDependencyGraph(rules);

  // Queue: start with nodes that have no dependencies (in-degree = 0)
  const queue = [];
  for (const [code, degree] of inDegree) {
    if (degree === 0) {
      queue.push(code);
    }
  }

  const sorted = [];
  let processedCount = 0;

  while (queue.length > 0) {
    // Sort queue by sequence for deterministic ordering among independent nodes
    queue.sort((a, b) => {
      const ruleA = nodeMap.get(a);
      const ruleB = nodeMap.get(b);
      return (ruleA.sequence || 0) - (ruleB.sequence || 0);
    });

    const current = queue.shift();
    sorted.push(nodeMap.get(current));
    processedCount++;

    // Reduce in-degree of dependent nodes
    for (const dependent of adjacency.get(current)) {
      const newDegree = inDegree.get(dependent) - 1;
      inDegree.set(dependent, newDegree);
      if (newDegree === 0) {
        queue.push(dependent);
      }
    }
  }

  // If we haven't processed all nodes, there's a cycle
  if (processedCount !== rules.length) {
    const unprocessed = rules
      .filter((r) => !sorted.find((s) => s.code === r.code))
      .map((r) => r.code);
    throw AppError.badRequest(
      `Circular dependency detected among rules: ${unprocessed.join(', ')}. ` +
      'Please review computation_basis and formula references.'
    );
  }

  return sorted;
}

/**
 * Build the computation context from employee, contract, attendance, and timeoff data
 * 
 * @param {Object} employee - Employee record
 * @param {Object} contract - Active contract record
 * @param {Object} attendance - Attendance summary { worked_days, total_hours }
 * @param {number} timeoffDays - Approved time off days
 * @param {string} periodStart - Period start date
 * @param {string} periodEnd - Period end date
 * @returns {Object} Computation context
 */
function buildContext(employee, contract, attendance, timeoffDays, periodStart, periodEnd) {
  const totalWorkingDays = getWorkingDays(periodStart, periodEnd);
  const workedDays = attendance.worked_days || 0;
  const effectiveWorkedDays = Math.min(workedDays + (timeoffDays || 0), totalWorkingDays);

  return {
    employee: {
      id: employee.id,
      name: `${employee.first_name} ${employee.last_name}`,
      department: employee.department,
      designation: employee.designation,
    },
    contract: {
      id: contract.id,
      wage: parseFloat(contract.wage) || 0,
      wage_type: contract.wage_type || 'MONTHLY',
      structure_id: contract.structure_id,
    },
    attendance: {
      worked_days: effectiveWorkedDays,
      total_days: totalWorkingDays,
      total_hours: attendance.total_hours || 0,
      ratio: totalWorkingDays > 0 ? effectiveWorkedDays / totalWorkingDays : 1,
    },
    timeoff: {
      approved_days: timeoffDays || 0,
    },
    period: {
      start: periodStart,
      end: periodEnd,
    },
    rules: {},       // Accumulated rule results: { BASIC: 50000, HRA: 20000, ... }
    variables: {},   // Alias for formula access
  };
}

/**
 * Execute a single salary rule against the computation context
 * 
 * @param {Object} rule - Salary rule to execute
 * @param {Object} context - Computation context
 * @returns {number} Computed amount
 */
function executeRule(rule, context) {
  // Check condition (if any)
  if (rule.condition) {
    const conditionMet = evaluateCondition(rule.condition, context);
    if (!conditionMet) {
      return 0;
    }
  }

  let amount = 0;

  switch (rule.computation_type) {
    case 'FIXED': {
      amount = parseFloat(rule.amount) || 0;
      // Pro-rate based on attendance ratio (for non-full-month)
      if (rule.category !== 'NET' && rule.category !== 'GROSS') {
        amount = amount * context.attendance.ratio;
      }
      break;
    }

    case 'PERCENTAGE': {
      const basisCode = rule.computation_basis;
      let basisAmount = 0;
      if (basisCode === 'WAGE') {
        basisAmount = context.contract ? (context.contract.wage || 0) : 0;
      } else if (context.rules[basisCode] !== undefined) {
        basisAmount = context.rules[basisCode];
      }
      const percentage = parseFloat(rule.amount) || 0;
      amount = basisAmount * percentage;
      break;
    }

    case 'FORMULA': {
      if (!rule.formula) {
        throw AppError.badRequest(`Rule "${rule.code}" is FORMULA type but has no formula defined`);
      }

      // Build variable scope from accumulated rule results + special variables
      const scope = {
        ...context.variables,
        ...context.rules,
        WAGE: context.contract.wage,
        WORKED_DAYS: context.attendance.worked_days,
        TOTAL_DAYS: context.attendance.total_days,
        ATTENDANCE_RATIO: context.attendance.ratio,
        TIMEOFF_DAYS: context.timeoff.approved_days,
      };

      amount = safeEvaluate(rule.formula, scope);
      break;
    }

    default:
      throw AppError.badRequest(`Unknown computation type: ${rule.computation_type}`);
  }

  return roundToPaysa(amount);
}

/**
 * Evaluate a condition string safely
 * Supports: >, <, >=, <=, ==, !=, &&, ||
 * 
 * @param {string} condition - Condition expression
 * @param {Object} context - Computation context
 * @returns {boolean}
 */
function evaluateCondition(condition, context) {
  try {
    // Replace common variable references
    let expr = condition;
    expr = expr.replace(/contract\.wage/g, String(context.contract.wage));
    expr = expr.replace(/attendance\.worked_days/g, String(context.attendance.worked_days));
    expr = expr.replace(/attendance\.total_days/g, String(context.attendance.total_days));
    expr = expr.replace(/timeoff\.approved_days/g, String(context.timeoff.approved_days));

    // Replace rule references
    for (const [code, value] of Object.entries(context.rules)) {
      const regex = new RegExp(`\\b${code}\\b`, 'g');
      expr = expr.replace(regex, String(value));
    }

    // Evaluate simple conditions using safe comparison
    // Support patterns like: "50000 > 0", "50000 >= 15000"
    const comparisonMatch = expr.match(/^\s*([\d.]+)\s*(>|<|>=|<=|==|!=)\s*([\d.]+)\s*$/);
    if (comparisonMatch) {
      const left = parseFloat(comparisonMatch[1]);
      const op = comparisonMatch[2];
      const right = parseFloat(comparisonMatch[3]);

      switch (op) {
        case '>': return left > right;
        case '<': return left < right;
        case '>=': return left >= right;
        case '<=': return left <= right;
        case '==': return left === right;
        case '!=': return left !== right;
        default: return true;
      }
    }

    // For complex conditions with && and ||, split and evaluate each part
    if (expr.includes('&&')) {
      return expr.split('&&').every((part) => evaluateCondition(part.trim(), context));
    }
    if (expr.includes('||')) {
      return expr.split('||').some((part) => evaluateCondition(part.trim(), context));
    }

    // Default: if we can't parse, assume true (don't block computation)
    return true;
  } catch {
    // Condition evaluation failure should not block computation
    return true;
  }
}

/**
 * Build payslip lines from accumulated rule results
 * 
 * @param {Object} rulesMap - { code: amount } map
 * @param {Object[]} sortedRules - Rules in execution order
 * @returns {Object[]} Payslip line items
 */
function buildPayslipLines(rulesMap, sortedRules) {
  return sortedRules
    .filter((rule) => rule.appears_on_payslip !== false)
    .map((rule) => ({
      rule_id: rule.id,
      code: rule.code,
      name: rule.name,
      category: rule.category,
      sequence: rule.sequence,
      amount: rulesMap[rule.code] || 0,
    }));
}

/**
 * Validate computed payslip data
 * 
 * @param {Object[]} lines - Payslip lines
 * @param {Object} context - Computation context
 * @throws {AppError} If validation fails
 */
function validatePayslipData(lines, context) {
  const errors = [];

  const gross = context.rules.GROSS || 0;
  const net = context.rules.NET || 0;

  if (gross < 0) {
    errors.push('Gross salary cannot be negative');
  }

  if (net < 0) {
    errors.push('Net salary cannot be negative');
  }

  // Check for negative deductions
  const deductions = lines.filter((l) => l.category === 'DEDUCTION');
  for (const d of deductions) {
    if (d.amount < 0) {
      errors.push(`Deduction "${d.name}" has negative amount: ${d.amount}`);
    }
  }

  if (errors.length > 0) {
    throw AppError.unprocessable('Payslip validation failed', errors);
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THE MAIN COMPUTATION PIPELINE
 * Computes a single employee's payslip for a given period
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * @param {Object} params
 * @param {Object} params.employee - Employee record
 * @param {Object} params.contract - Active contract for the period
 * @param {Object} params.attendance - Attendance summary { worked_days, total_hours }
 * @param {number} params.timeoffDays - Approved time off days
 * @param {Object[]} params.rules - Salary rules (sorted by sequence)
 * @param {string} params.periodStart - Period start date
 * @param {string} params.periodEnd - Period end date
 * @returns {Object} Computed payslip data { lines, gross, total_deductions, net, worked_days, total_days }
 */
function computePayslip({ employee, contract, attendance, timeoffDays, rules, periodStart, periodEnd }) {
  // Step 1: Build computation context
  const context = buildContext(employee, contract, attendance, timeoffDays, periodStart, periodEnd);

  // Step 2: Topological sort of rules
  const sortedRules = topologicalSort(rules);

  // Step 3: Execute each rule in dependency order
  for (const rule of sortedRules) {
    const result = executeRule(rule, context);
    context.rules[rule.code] = result;
    context.variables[rule.code] = result;
  }

  // Step 4: Build payslip lines
  const lines = buildPayslipLines(context.rules, sortedRules);

  // Step 5: Calculate totals
  const gross = context.rules.GROSS || lines
    .filter((l) => ['BASIC', 'ALLOWANCE', 'GROSS'].includes(l.category))
    .reduce((sum, l) => sum + l.amount, 0);

  const totalDeductions = lines
    .filter((l) => l.category === 'DEDUCTION')
    .reduce((sum, l) => sum + l.amount, 0);

  const net = context.rules.NET || (gross - totalDeductions);

  // Update context with computed totals (for validation)
  if (!context.rules.GROSS) context.rules.GROSS = gross;
  if (!context.rules.NET) context.rules.NET = net;

  // Step 6: Validate
  validatePayslipData(lines, context);

  return {
    lines,
    gross: roundToPaysa(gross),
    total_deductions: roundToPaysa(totalDeductions),
    net: roundToPaysa(net),
    worked_days: context.attendance.worked_days,
    total_days: context.attendance.total_days,
    computation_log: Object.entries(context.rules).map(([code, amount]) => ({
      code,
      amount,
    })),
  };
}

module.exports = {
  buildDependencyGraph,
  topologicalSort,
  buildContext,
  executeRule,
  evaluateCondition,
  buildPayslipLines,
  validatePayslipData,
  computePayslip,
  getDependencies,
};
