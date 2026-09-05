/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PAYRUN STATE MACHINE UNIT TESTS
 * Tests the state transition logic: DRAFT → COMPUTED → VALIDATED → PAID
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { VALID_TRANSITIONS, PAYRUN_STATES } = require('../../src/models/payrun.model');

// ─────────────────────────────────────────────────────────────────────────────
// State Machine Transition Validation Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Payrun State Machine', () => {
  describe('Valid Transitions', () => {
    test('DRAFT can transition to COMPUTED', () => {
      expect(VALID_TRANSITIONS.DRAFT).toContain('COMPUTED');
    });

    test('DRAFT can transition to ARCHIVED', () => {
      expect(VALID_TRANSITIONS.DRAFT).toContain('ARCHIVED');
    });

    test('COMPUTED can transition to VALIDATED', () => {
      expect(VALID_TRANSITIONS.COMPUTED).toContain('VALIDATED');
    });

    test('COMPUTED can transition back to DRAFT (recomputation)', () => {
      expect(VALID_TRANSITIONS.COMPUTED).toContain('DRAFT');
    });

    test('VALIDATED can transition to PAID', () => {
      expect(VALID_TRANSITIONS.VALIDATED).toContain('PAID');
    });

    test('VALIDATED can transition back to COMPUTED (re-validation)', () => {
      expect(VALID_TRANSITIONS.VALIDATED).toContain('COMPUTED');
    });

    test('PAID can transition to ARCHIVED', () => {
      expect(VALID_TRANSITIONS.PAID).toContain('ARCHIVED');
    });

    test('ARCHIVED has no valid transitions', () => {
      expect(VALID_TRANSITIONS.ARCHIVED).toEqual([]);
    });
  });

  describe('Invalid Transitions', () => {
    test('DRAFT cannot transition directly to PAID', () => {
      expect(VALID_TRANSITIONS.DRAFT).not.toContain('PAID');
    });

    test('DRAFT cannot transition directly to VALIDATED', () => {
      expect(VALID_TRANSITIONS.DRAFT).not.toContain('VALIDATED');
    });

    test('COMPUTED cannot transition directly to PAID', () => {
      expect(VALID_TRANSITIONS.COMPUTED).not.toContain('PAID');
    });

    test('PAID cannot transition back to DRAFT', () => {
      expect(VALID_TRANSITIONS.PAID).not.toContain('DRAFT');
    });

    test('PAID cannot transition back to COMPUTED', () => {
      expect(VALID_TRANSITIONS.PAID).not.toContain('COMPUTED');
    });

    test('PAID cannot transition back to VALIDATED', () => {
      expect(VALID_TRANSITIONS.PAID).not.toContain('VALIDATED');
    });
  });

  describe('State Definitions', () => {
    test('all states are defined', () => {
      expect(PAYRUN_STATES).toEqual(['DRAFT', 'COMPUTED', 'VALIDATED', 'PAID', 'ARCHIVED']);
    });

    test('all states have transition rules', () => {
      for (const state of PAYRUN_STATES) {
        expect(VALID_TRANSITIONS).toHaveProperty(state);
        expect(Array.isArray(VALID_TRANSITIONS[state])).toBe(true);
      }
    });

    test('all transition targets are valid states', () => {
      for (const [state, targets] of Object.entries(VALID_TRANSITIONS)) {
        for (const target of targets) {
          expect(PAYRUN_STATES).toContain(target);
        }
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Utility/Currency Tests
// ─────────────────────────────────────────────────────────────────────────────

const { formatCurrency, roundToPaysa, amountInWords, annualToMonthly } = require('../../src/utils/currency.utils');
const { getWorkingDays, getCalendarDays, dateRangesOverlap, calculateHours } = require('../../src/utils/date.utils');

describe('Currency Utilities', () => {
  test('formats INR currency correctly', () => {
    expect(formatCurrency(50000)).toBe('₹50,000.00');
    expect(formatCurrency(1234567.89)).toBe('₹12,34,567.89');
    expect(formatCurrency(0)).toBe('₹0.00');
    expect(formatCurrency(-5000)).toBe('-₹5,000.00');
  });

  test('rounds to paisa correctly', () => {
    expect(roundToPaysa(100.555)).toBe(100.56);
    expect(roundToPaysa(100.554)).toBe(100.55);
    expect(roundToPaysa(100)).toBe(100);
  });

  test('converts annual to monthly', () => {
    expect(annualToMonthly(600000)).toBe(50000);
    expect(annualToMonthly(1200000)).toBe(100000);
  });

  test('converts amount to words', () => {
    const words = amountInWords(50000);
    expect(words).toContain('Fifty Thousand');
    expect(words).toContain('Rupees Only');
  });

  test('handles crore in amount to words', () => {
    const words = amountInWords(15000000);
    expect(words).toContain('Crore');
  });
});

describe('Date Utilities', () => {
  test('calculates working days correctly', () => {
    // September 2026: 1st is Tuesday, 30th is Wednesday → 22 working days
    const days = getWorkingDays('2026-09-01', '2026-09-30');
    expect(days).toBe(22);
  });

  test('calculates calendar days correctly', () => {
    const days = getCalendarDays('2026-09-01', '2026-09-30');
    expect(days).toBe(30);
  });

  test('detects overlapping date ranges', () => {
    expect(dateRangesOverlap('2026-09-01', '2026-09-30', '2026-09-15', '2026-10-15')).toBe(true);
    expect(dateRangesOverlap('2026-09-01', '2026-09-30', '2026-10-01', '2026-10-31')).toBe(false);
  });

  test('calculates hours between timestamps', () => {
    const hours = calculateHours('2026-09-01T09:00:00', '2026-09-01T17:30:00');
    expect(hours).toBe(8.5);
  });
});
