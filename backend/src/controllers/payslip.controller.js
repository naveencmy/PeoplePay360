const payslipService = require('../services/payslip.service');
const pdfService = require('../services/pdf.service');
const emailService = require('../services/email.service');
const { sendSuccess } = require('../utils/response.utils');

// ─────────────────────────────────────────────────────────────────────────────
// Payslip Controller
// ─────────────────────────────────────────────────────────────────────────────

async function getPayslip(req, res) {
  const payslip = await payslipService.getPayslip(req.params.id);
  sendSuccess(res, payslip);
}

async function getPayslipsByPayrun(req, res) {
  const payslips = await payslipService.getPayslipsByPayrun(req.params.payrunId);
  sendSuccess(res, payslips);
}

async function getPayslipsByEmployee(req, res) {
  const result = await payslipService.getPayslipsByEmployee(req.params.employeeId, req.query);
  sendSuccess(res, result.payslips, 'Payslips retrieved', 200, result.pagination);
}

async function downloadPDF(req, res) {
  const payslip = await payslipService.getPayslip(req.params.id);
  const pdfBuffer = await pdfService.generatePayslipPDF(payslip);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="payslip_${payslip.employee_code || payslip.employee_id}.pdf"`,
    'Content-Length': pdfBuffer.length,
  });

  res.send(pdfBuffer);
}

async function emailPayslip(req, res) {
  const payslip = await payslipService.getPayslip(req.params.id);

  await emailService.sendPayslipEmail(payslip, {
    first_name: payslip.first_name,
    last_name: payslip.last_name,
    email: payslip.email,
    employee_code: payslip.employee_code,
    department: payslip.department,
  });

  sendSuccess(res, null, 'Payslip emailed successfully');
}

async function bulkEmailPayslips(req, res) {
  const payslips = await payslipService.getPayslipsByPayrun(req.params.payrunId);

  const enrichedPayslips = payslips.map((ps) => ({
    ...ps,
    first_name: ps.first_name,
    last_name: ps.last_name,
    email: ps.email,
    employee_code: ps.employee_code,
    department: ps.department,
  }));

  const result = await emailService.bulkSendPayslips(enrichedPayslips);
  sendSuccess(res, result, `Sent: ${result.sent.length}, Failed: ${result.failed.length}`);
}

async function listPayslips(req, res) {
  if (req.query.payrun_id) {
    const payslips = await payslipService.getPayslipsByPayrun(req.query.payrun_id);
    return sendSuccess(res, payslips);
  }
  if (req.query.employee_id) {
    const result = await payslipService.getPayslipsByEmployee(req.query.employee_id, req.query);
    return sendSuccess(res, result.payslips, 'Payslips retrieved', 200, result.pagination);
  }
  const payslipRepo = require('../repositories/payslip.repository');
  const result = await payslipRepo.raw(
    `SELECT ps.*, e.first_name, e.last_name, e.employee_code, e.department, e.email, p.name as payrun_name
     FROM payslips ps
     JOIN employees e ON e.id = ps.employee_id
     LEFT JOIN payruns p ON p.id = ps.payrun_id
     WHERE ps.deleted_at IS NULL
     ORDER BY ps.created_at DESC LIMIT 100`
  );
  sendSuccess(res, result.rows);
}

module.exports = { getPayslip, getPayslipsByPayrun, getPayslipsByEmployee, downloadPDF, emailPayslip, bulkEmailPayslips, listPayslips };
