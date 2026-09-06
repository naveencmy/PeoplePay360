const PDFDocument = require('pdfkit');
const { loadEnv } = require('../config/env');
const { formatCurrency, amountInWords } = require('../utils/currency.utils');
const { formatDisplayDate, getPeriodLabel } = require('../utils/date.utils');

// ─────────────────────────────────────────────────────────────────────────────
// PDF Service — Professional payslip PDF generation using PDFKit
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a professional payslip PDF
 * @param {Object} payslipData - Full payslip with employee details
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generatePayslipPDF(payslipData) {
  return new Promise((resolve, reject) => {
    try {
      const env = loadEnv();
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const lines = typeof payslipData.lines === 'string'
        ? JSON.parse(payslipData.lines)
        : (payslipData.lines || []);

      const formatPDFCurrency = (amount) => formatCurrency(amount, 'Rs. ');

      const earnings = lines.filter(
        (l) => !['DEDUCTION', 'GROSS', 'NET'].includes(l.category) && !['GROSS', 'NET'].includes(l.code)
      );
      const deductions = lines.filter(
        (l) => l.category === 'DEDUCTION' && !['GROSS', 'NET'].includes(l.code)
      );

      // ─── HEADER ─────────────────────────────────────────────
      doc.rect(50, 50, 495, 60).fill('#4A56E2');
      doc.fillColor('#FFFFFF')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text(env.COMPANY_NAME, 60, 65, { width: 475, align: 'center' });
      doc.fontSize(10)
        .font('Helvetica')
        .text('PAYSLIP', 60, 90, { width: 475, align: 'center' });

      // ─── PERIOD BAR ────────────────────────────────────────
      const period = getPeriodLabel(payslipData.period_start);
      doc.rect(50, 120, 495, 25).fill('#F0F0F7');
      doc.fillColor('#333333')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`Pay Period: ${period}`, 60, 126, { width: 475, align: 'center' });

      // ─── EMPLOYEE DETAILS ──────────────────────────────────
      let y = 158;
      doc.fillColor('#333333').fontSize(9);

      const leftCol = [
        ['Employee Name', `${payslipData.first_name || ''} ${payslipData.last_name || ''}`.trim() || 'N/A'],
        ['Employee ID', payslipData.employee_code || 'N/A'],
        ['Department', payslipData.department || 'N/A'],
        ['Designation', payslipData.designation || 'N/A'],
      ];

      const rightCol = [
        ['Pay Period', `${formatDisplayDate(payslipData.period_start)} to ${formatDisplayDate(payslipData.period_end)}`],
        ['Worked Days', `${payslipData.worked_days || 0} / ${payslipData.total_days || 0}`],
        ['Bank Account', payslipData.bank_account_number ? `XXXX${payslipData.bank_account_number.slice(-4)}` : 'N/A'],
        ['IFSC', payslipData.bank_ifsc || 'N/A'],
      ];

      for (let i = 0; i < leftCol.length; i++) {
        const leftVal = String(leftCol[i][1] || 'N/A');
        const rightVal = String(rightCol[i][1] || 'N/A');

        doc.font('Helvetica-Bold').text(leftCol[i][0] + ':', 60, y, { width: 95 });
        doc.font('Helvetica').text(leftVal, 158, y, { width: 140 });

        doc.font('Helvetica-Bold').text(rightCol[i][0] + ':', 305, y, { width: 85 });
        doc.font('Helvetica').text(rightVal, 392, y, { width: 153 });

        const rowHeight = Math.max(
          doc.heightOfString(leftVal, { width: 140 }),
          doc.heightOfString(rightVal, { width: 153 }),
          14
        );
        y += rowHeight + 4;
      }

      // ─── DIVIDER ───────────────────────────────────────────
      y += 6;
      doc.moveTo(50, y).lineTo(545, y).stroke('#CCCCCC');
      y += 14;

      // ─── EARNINGS & DEDUCTIONS TABLE ───────────────────────
      // Table headers
      doc.rect(50, y, 240, 22).fill('#4A56E2');
      doc.rect(300, y, 245, 22).fill('#E74C3C');

      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold');
      doc.text('EARNINGS', 60, y + 5, { width: 220, align: 'center' });
      doc.text('DEDUCTIONS', 310, y + 5, { width: 225, align: 'center' });

      y += 25;

      // Sub-headers
      doc.fillColor('#666666').fontSize(9).font('Helvetica-Bold');
      doc.text('Component', 60, y);
      doc.text('Amount', 200, y, { width: 80, align: 'right' });
      doc.text('Component', 310, y);
      doc.text('Amount', 455, y, { width: 80, align: 'right' });

      y += 15;
      doc.moveTo(50, y).lineTo(290, y).stroke('#EEEEEE');
      doc.moveTo(300, y).lineTo(545, y).stroke('#EEEEEE');
      y += 5;

      // Table rows
      const maxRows = Math.max(earnings.length, deductions.length);
      doc.fontSize(9).font('Helvetica').fillColor('#333333');

      for (let i = 0; i < maxRows; i++) {
        if (i % 2 === 0) {
          doc.rect(50, y - 2, 240, 16).fill('#FAFAFA');
          doc.rect(300, y - 2, 245, 16).fill('#FAFAFA');
          doc.fillColor('#333333');
        }

        if (earnings[i]) {
          doc.text(earnings[i].name, 60, y, { width: 140 });
          doc.text(formatPDFCurrency(earnings[i].amount), 200, y, { width: 80, align: 'right' });
        }

        if (deductions[i]) {
          doc.text(deductions[i].name, 310, y, { width: 140 });
          doc.text(formatPDFCurrency(deductions[i].amount), 455, y, { width: 80, align: 'right' });
        }

        y += 18;
      }

      // ─── TOTALS ────────────────────────────────────────────
      y += 10;
      doc.moveTo(50, y).lineTo(545, y).stroke('#333333');
      y += 8;

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333');
      doc.text('Gross Earnings:', 60, y);
      doc.text(formatPDFCurrency(payslipData.gross), 200, y, { width: 80, align: 'right' });
      doc.text('Total Deductions:', 310, y);
      doc.text(formatPDFCurrency(payslipData.total_deductions || 0), 455, y, { width: 80, align: 'right' });

      y += 25;

      // NET PAY highlight box
      doc.rect(50, y, 495, 35).fill('#27AE60');
      doc.fillColor('#FFFFFF')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('NET PAY', 60, y + 9);
      doc.text(formatPDFCurrency(payslipData.net), 300, y + 9, { width: 235, align: 'right' });

      y += 45;

      // Amount in words
      doc.fillColor('#666666')
        .fontSize(9)
        .font('Helvetica-Oblique')
        .text(`Amount in words: ${amountInWords(payslipData.net)}`, 60, y);

      // ─── FOOTER ────────────────────────────────────────────
      const footerY = 760;
      doc.moveTo(50, footerY).lineTo(545, footerY).stroke('#EEEEEE');

      doc.fillColor('#999999')
        .fontSize(8)
        .font('Helvetica')
        .text(
          'This is a computer-generated document and does not require a signature.',
          50, footerY + 10,
          { width: 495, align: 'center' }
        );
      doc.text(
        `${env.COMPANY_NAME} | Generated on ${formatDisplayDate(new Date())}`,
        50, footerY + 22,
        { width: 495, align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generatePayslipPDF };
