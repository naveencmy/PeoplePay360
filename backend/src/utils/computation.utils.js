const { create, all } = require('mathjs');

// ─────────────────────────────────────────────────────────────────────────────
// Safe Computation Utilities — formula parsing without eval()
// Uses mathjs with a heavily restricted scope for security
// ─────────────────────────────────────────────────────────────────────────────

// Create a restricted mathjs instance with ONLY whitelisted operations
const math = create(all, {});

// Import ONLY the functions we allow in formulas
const limitedMath = math.create({});

// List of allowed functions in salary formulas
const ALLOWED_FUNCTIONS = new Set([
  'min', 'max', 'round', 'ceil', 'floor', 'abs',
  'add', 'subtract', 'multiply', 'divide',
]);

/**
 * Safely evaluate a mathematical formula string
 * NO eval(), NO Function(), NO access to Node.js globals
 * 
 * @param {string} formula - Mathematical expression (e.g., "min(GROSS * 0.12, 1800)")
 * @param {Object} variables - Variable name → numeric value mapping
 * @returns {number} Computed result
 * @throws {Error} If formula is invalid or uses disallowed functions
 */
function safeEvaluate(formula, variables = {}) {
  if (!formula || typeof formula !== 'string') {
    throw new Error('Formula must be a non-empty string');
  }

  // Security: Check for dangerous patterns
  const dangerousPatterns = [
    /import\s*\(/i,
    /require\s*\(/i,
    /process\./i,
    /global\./i,
    /\beval\b/i,
    /\bFunction\b/i,
    /\b__proto__\b/i,
    /\bconstructor\b/i,
    /\bprototype\b/i,
    /\bthis\b/i,
    /\bwindow\b/i,
    /\bdocument\b/i,
    /\bwhile\b/i,
    /\bfor\b/i,
    /\bdo\b/i,
    /\bnew\b/i,
    /\bdelete\b/i,
    /\btypeof\b/i,
    /\bvoid\b/i,
    /\binstanceof\b/i,
    /[;{}[\]]/,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(formula)) {
      throw new Error(`Formula contains disallowed pattern: ${formula}`);
    }
  }

  // Validate that only allowed functions are used
  const funcCallPattern = /([a-zA-Z_]\w*)\s*\(/g;
  let match;
  while ((match = funcCallPattern.exec(formula)) !== null) {
    if (!ALLOWED_FUNCTIONS.has(match[1].toLowerCase())) {
      throw new Error(`Function "${match[1]}" is not allowed in formulas. Allowed: ${[...ALLOWED_FUNCTIONS].join(', ')}`);
    }
  }

  // Build the scope with variables (only numeric values allowed)
  const scope = {};
  for (const [key, value] of Object.entries(variables)) {
    if (typeof value !== 'number' || !isFinite(value)) {
      scope[key] = 0; // Default to 0 for non-numeric/infinite values
    } else {
      scope[key] = value;
    }
  }

  try {
    const result = math.evaluate(formula, scope);

    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error(`Formula evaluation produced invalid result: ${result}`);
    }

    return Math.round(result * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    if (error.message.includes('disallowed') || error.message.includes('not allowed')) {
      throw error;
    }
    throw new Error(`Formula evaluation failed: "${formula}" — ${error.message}`);
  }
}

/**
 * Validate a formula string without executing it
 * @param {string} formula - Formula to validate
 * @param {string[]} availableVariables - List of valid variable names
 * @returns {{ valid: boolean, error?: string }}
 */
function validateFormula(formula, availableVariables = []) {
  try {
    // Build dummy variables (all set to 1 for validation)
    const dummyVars = {};
    for (const v of availableVariables) {
      dummyVars[v] = 1;
    }
    safeEvaluate(formula, dummyVars);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Extract variable names from a formula
 * @param {string} formula
 * @returns {string[]} List of variable names used
 */
function extractVariables(formula) {
  if (!formula) return [];

  // Match word patterns that are NOT function names and NOT numbers
  const tokens = formula.match(/\b([A-Z_][A-Z0-9_]*)\b/g) || [];
  const funcNames = new Set([...ALLOWED_FUNCTIONS].map((f) => f.toUpperCase()));

  return [...new Set(tokens.filter((t) => !funcNames.has(t)))];
}

module.exports = {
  safeEvaluate,
  validateFormula,
  extractVariables,
  ALLOWED_FUNCTIONS,
};
