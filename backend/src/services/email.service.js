const nodemailer = require('nodemailer');
const { loadEnv } = require('../config/env');
const { generatePayslipEmailHTML, generateNotificationHTML } = require('../utils/email.utils');
const { generatePayslipPDF } = require('./pdf.service');
const { getPeriodLabel } = require('../utils/date.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Email Service — Payslip delivery with bulk sending, retry, and rate limiting
// ─────────────────────────────────────────────────────────────────────────────

let transporter = null;

/**
 * Get or create the email transporter
 */
function getTransporter() {
  if (!transporter) {
    const env = loadEnv();
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: (env.SMTP_USER && env.SMTP_PASSWORD)
        ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
        : undefined,
    });
  }
  return transporter;
}

/**
 * Send a single payslip email with PDF attachment
 */
async function sendPayslipEmail(payslipData, employee) {
  const env = loadEnv();
  const period = getPeriodLabel(payslipData.period_start);

  // Generate PDF
  const pdfBuffer = await generatePayslipPDF(payslipData);

  // Generate HTML
  const html = generatePayslipEmailHTML(payslipData, employee);

  const mailOptions = {
    from: `"${env.COMPANY_NAME} Payroll" <${env.SMTP_FROM}>`,
    to: employee.email,
    subject: `Your Payslip for ${period} — ${env.COMPANY_NAME}`,
    html,
    attachments: [
      {
        filename: `Payslip_${period.replace(' ', '_')}_${employee.first_name}_${employee.last_name}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  return getTransporter().sendMail(mailOptions);
}

/**
 * Bulk send payslips for a payrun
 * Processes in batches of 50 with 1-second delay between batches
 * 3 retries with exponential backoff per email
 * 
 * @param {Object[]} payslips - Array of payslip objects with employee data
 * @returns {{ sent: string[], failed: Object[] }}
 */
async function bulkSendPayslips(payslips) {
  const BATCH_SIZE = 50;
  const BATCH_DELAY_MS = 1000;
  const MAX_RETRIES = 3;

  const results = { sent: [], failed: [] };

  // Process in batches
  for (let i = 0; i < payslips.length; i += BATCH_SIZE) {
    const batch = payslips.slice(i, i + BATCH_SIZE);

    // Process batch concurrently
    const batchResults = await Promise.allSettled(
      batch.map(async (ps) => {
        let lastError = null;

        // Retry with exponential backoff
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            await sendPayslipEmail(ps, {
              first_name: ps.first_name,
              last_name: ps.last_name,
              email: ps.email,
              employee_code: ps.employee_code,
              department: ps.department,
            });
            return { success: true, employee_id: ps.employee_id, email: ps.email };
          } catch (error) {
            lastError = error;
            if (attempt < MAX_RETRIES - 1) {
              // Exponential backoff: 2s, 4s, 8s
              await sleep(Math.pow(2, attempt + 1) * 1000);
            }
          }
        }

        return {
          success: false,
          employee_id: ps.employee_id,
          email: ps.email,
          error: lastError?.message || 'Unknown error',
        };
      })
    );

    // Collect results
    for (const result of batchResults) {
      const value = result.status === 'fulfilled' ? result.value : { success: false, error: result.reason?.message };
      if (value.success) {
        results.sent.push(value.email);
      } else {
        results.failed.push(value);
      }
    }

    // Delay between batches (skip for last batch)
    if (i + BATCH_SIZE < payslips.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  return results;
}

/**
 * Send a generic notification email
 */
async function sendNotification(to, subject, title, body) {
  const env = loadEnv();
  const html = generateNotificationHTML(title, body);

  return getTransporter().sendMail({
    from: `"${env.COMPANY_NAME}" <${env.SMTP_FROM}>`,
    to,
    subject,
    html,
  });
}

/**
 * Sleep utility for batch delays
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  sendPayslipEmail,
  bulkSendPayslips,
  sendNotification,
};
