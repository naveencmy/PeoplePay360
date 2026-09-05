const { loadEnv } = require('../config/env');
const { formatCurrency } = require('./currency.utils');
const { formatDisplayDate, getPeriodLabel } = require('./date.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Email Templates — HTML email generation for payslips and notifications
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate payslip email HTML
 * @param {Object} payslip - Payslip data
 * @param {Object} employee - Employee data
 * @returns {string} HTML email body
 */
function generatePayslipEmailHTML(payslip, employee) {
  const env = loadEnv();
  const period = getPeriodLabel(payslip.period_start);

  const earningsLines = (payslip.lines || [])
    .filter((l) => l.category !== 'DEDUCTION')
    .map((l) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${l.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(l.amount)}</td></tr>`)
    .join('');

  const deductionLines = (payslip.lines || [])
    .filter((l) => l.category === 'DEDUCTION')
    .map((l) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${l.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(l.amount)}</td></tr>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:'Segoe UI',Arial,sans-serif;background:#f4f6f9;padding:20px;margin:0">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:30px;text-align:center;color:#fff">
          <h1 style="margin:0;font-size:24px">${env.COMPANY_NAME}</h1>
          <p style="margin:8px 0 0;opacity:0.9">Payslip for ${period}</p>
        </div>

        <!-- Employee Info -->
        <div style="padding:20px 30px;border-bottom:1px solid #eee">
          <p style="margin:4px 0"><strong>Employee:</strong> ${employee.first_name} ${employee.last_name}</p>
          <p style="margin:4px 0"><strong>Employee ID:</strong> ${employee.employee_code || 'N/A'}</p>
          <p style="margin:4px 0"><strong>Department:</strong> ${employee.department || 'N/A'}</p>
          <p style="margin:4px 0"><strong>Period:</strong> ${formatDisplayDate(payslip.period_start)} — ${formatDisplayDate(payslip.period_end)}</p>
          <p style="margin:4px 0"><strong>Worked Days:</strong> ${payslip.worked_days || 0}</p>
        </div>

        <!-- Earnings -->
        <div style="padding:20px 30px">
          <h3 style="color:#667eea;margin-top:0">Earnings</h3>
          <table style="width:100%;border-collapse:collapse">${earningsLines || '<tr><td colspan="2" style="padding:8px;color:#999">No earnings</td></tr>'}</table>
        </div>

        <!-- Deductions -->
        <div style="padding:0 30px 20px">
          <h3 style="color:#e74c3c;margin-top:0">Deductions</h3>
          <table style="width:100%;border-collapse:collapse">${deductionLines || '<tr><td colspan="2" style="padding:8px;color:#999">No deductions</td></tr>'}</table>
        </div>

        <!-- Totals -->
        <div style="padding:20px 30px;background:#f8f9fa;border-top:2px solid #667eea">
          <table style="width:100%">
            <tr>
              <td style="padding:6px 0"><strong>Gross Salary:</strong></td>
              <td style="text-align:right;font-size:16px">${formatCurrency(payslip.gross)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0"><strong>Total Deductions:</strong></td>
              <td style="text-align:right;font-size:16px;color:#e74c3c">${formatCurrency(payslip.total_deductions || 0)}</td>
            </tr>
            <tr style="border-top:2px solid #333">
              <td style="padding:12px 0"><strong style="font-size:18px">Net Pay:</strong></td>
              <td style="text-align:right;font-size:20px;color:#27ae60;font-weight:bold">${formatCurrency(payslip.net)}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="padding:15px 30px;text-align:center;color:#999;font-size:12px;border-top:1px solid #eee">
          <p>This is a computer-generated document and does not require a signature.</p>
          <p>${env.COMPANY_NAME} &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate a generic notification email HTML
 * @param {string} title - Email title
 * @param {string} body - HTML body content
 * @returns {string} HTML email
 */
function generateNotificationHTML(title, body) {
  const env = loadEnv();
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:'Segoe UI',Arial,sans-serif;background:#f4f6f9;padding:20px;margin:0">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:30px;text-align:center;color:#fff">
          <h1 style="margin:0;font-size:24px">${env.COMPANY_NAME}</h1>
        </div>
        <div style="padding:30px">
          <h2 style="color:#333;margin-top:0">${title}</h2>
          ${body}
        </div>
        <div style="padding:15px 30px;text-align:center;color:#999;font-size:12px;border-top:1px solid #eee">
          <p>${env.COMPANY_NAME} &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = { generatePayslipEmailHTML, generateNotificationHTML };
