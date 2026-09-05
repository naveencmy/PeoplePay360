// ─────────────────────────────────────────────────────────────────────────────
// Date Utilities — period calculations, working days, formatting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the number of working days (Mon-Fri) between two dates
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {number} Working days count
 */
function getWorkingDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Get total calendar days between two dates (inclusive)
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {number}
 */
function getCalendarDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Get the start and end of a month for a given date
 * @param {Date|string} date
 * @returns {{ start: Date, end: Date }}
 */
function getMonthRange(date) {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start, end };
}

/**
 * Format date to ISO date string (YYYY-MM-DD)
 * @param {Date|string} date
 * @returns {string}
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Format date to display string (DD MMM YYYY)
 * @param {Date|string} date
 * @returns {string}
 */
function formatDisplayDate(date) {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Get the period label for a month (e.g., "September 2026")
 * @param {Date|string} date
 * @returns {string}
 */
function getPeriodLabel(date) {
  const d = new Date(date);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Check if two date ranges overlap
 * @param {Date|string} start1
 * @param {Date|string} end1
 * @param {Date|string} start2
 * @param {Date|string} end2
 * @returns {boolean}
 */
function dateRangesOverlap(start1, end1, start2, end2) {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  return s1 <= e2 && s2 <= e1;
}

/**
 * Calculate hours between two timestamps
 * @param {Date|string} checkIn
 * @param {Date|string} checkOut
 * @returns {number} Hours (decimal)
 */
function calculateHours(checkIn, checkOut) {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
}

module.exports = {
  getWorkingDays,
  getCalendarDays,
  getMonthRange,
  formatDate,
  formatDisplayDate,
  getPeriodLabel,
  dateRangesOverlap,
  calculateHours,
};
