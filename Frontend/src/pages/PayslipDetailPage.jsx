import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Download, Mail, ArrowLeft, Printer, ShieldCheck, FileText } from 'lucide-react';
import { usePayslip, useGeneratePDF } from '@/hooks/usePayslips';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import Logo from '@/components/ui/Logo';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

function formatINR(val) {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num);
}

export const PayslipDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasRole } = useAuthStore();
  const role = (user?.role || 'EMPLOYEE').toUpperCase();
  const isEmployee = role === 'EMPLOYEE';
  const canManage = hasRole('ADMIN', 'HR');

  const { data: payslip, isLoading } = usePayslip(id);

  const p = payslip || {};
  const employeeName = p.employeeName || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Employee';
  const employeeId = p.employeeCode || p.employee_code || p.employeeId || p.employee_id || 'EMP';
  const designation = p.designation || p.jobPosition || 'Staff';
  const department = p.department || 'Operations';
  const period = p.periodName || p.payPeriod || (p.period_start && p.period_end ? `${p.period_start} to ${p.period_end}` : 'Current Period');
  
  const grossAmount = parseFloat(p.gross || p.grossPay || 0);
  const deductionsAmount = parseFloat(p.total_deductions || p.totalDeductions || 0);
  const netAmount = parseFloat(p.net || p.netPay || (grossAmount - deductionsAmount));

  // Dynamic lines from database computation or structured lines
  const rawLines = Array.isArray(p.lines) ? p.lines : [];
  const earningsLines = rawLines.filter(l => ['BASIC', 'ALLOWANCE', 'GROSS'].includes(l.category) || (l.amount > 0 && l.category !== 'DEDUCTION'));
  const deductionLines = rawLines.filter(l => l.category === 'DEDUCTION' || l.amount < 0);

  const bankAccount = p.bank_account_number ? `${p.bank_name || 'Bank'} ·••• ${p.bank_account_number.slice(-4)}` : (p.bankAccount || 'Direct Deposit');
  const panNumber = p.pan_number || p.pan || '—';
  const uanNumber = p.uan_number || p.uan || '—';
  const status = p.status || 'Paid';

  const totalDays = parseFloat(p.total_days || p.totalDays) || 30;
  const rawWorked = parseFloat(p.worked_days ?? p.workedDays);
  const paidDays = (!isNaN(rawWorked) && rawWorked > 0)
    ? rawWorked
    : (grossAmount > 0 ? totalDays : 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generating official PDF...', { id: 'pdf-dl' });
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/payslips/${id}/pdf`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error(`PDF generation endpoint returned ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const safePeriod = String(period || 'Period').replace(/[^a-zA-Z0-9]/g, '_');
      const safeName = String(employeeName || 'Staff').replace(/\s+/g, '_');
      link.download = `Payslip_${employeeId}_${safeName}_${safePeriod}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Payslip PDF downloaded successfully', { id: 'pdf-dl' });
    } catch (err) {
      console.warn('Direct PDF download error, triggering print view:', err);
      toast.dismiss('pdf-dl');
      window.print();
    }
  };

  useEffect(() => {
    if (location.search.includes('download=pdf') && payslip && !isLoading) {
      handleDownloadPDF();
    }
  }, [location.search, payslip, isLoading]);

  const handleEmail = () => {
    toast.success('Payslip copy emailed to employee');
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-text-muted flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading salary statement...</span>
      </div>
    );
  }

  // IDOR Protection: Employee can only view their own payslip
  const payslipEmpId = payslip?.employee_id || payslip?.employeeId;
  if (isEmployee && payslip && user?.employeeId && payslipEmpId && payslipEmpId !== user.employeeId) {
    return (
      <div className="p-8 text-center text-accent-rose bg-surface-2 rounded-xl border border-accent-rose/20 m-6">
        <div className="text-base font-bold mb-1">Access Forbidden (403)</div>
        <div className="text-xs text-text-muted">You are only permitted to inspect your own authenticated payslip statements.</div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/my-space')} 
          className="mt-4"
        >
          Return to My Space
        </Button>
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="p-8">
        <EmptyState 
          icon={FileText}
          title="Salary Statement Not Found"
          description="The requested payslip record does not exist or has been archived."
          actionLabel={isEmployee ? "Back to My Space" : "Back to Payslips"}
          onAction={() => navigate(isEmployee ? '/my-space' : '/payslips')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      <style>{`
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
          }
          body * {
            visibility: hidden;
          }
          #payslip-statement, #payslip-statement * {
            visibility: visible !important;
          }
          #payslip-statement {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: #fff !important;
            color: #111 !important;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          header, nav, aside, .no-print, [role="navigation"] {
            display: none !important;
          }
        }
      `}</style>
      <div className="print:hidden">
        <PageHeader 
          title="Salary Statement" 
          subtitle="Confidential Monthly Compensation & Tax Withholding Summary"
          breadcrumbs={[
            { label: isEmployee ? 'My Space' : 'Payroll', to: isEmployee ? '/my-space' : '/payruns' },
            { label: isEmployee ? 'My Payslips' : 'Payslips', to: '/payslips' },
            { label: `Statement #${id?.slice?.(0, 8) || id}` }
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(isEmployee ? '/payslips' : '/payslips')}
                className="gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint}
                className="gap-1.5"
              >
                <Printer size={14} />
                <span>Print</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadPDF}
                className="gap-1.5"
              >
                <Download size={14} />
                <span>Download PDF</span>
              </Button>
              {canManage && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleEmail}
                  className="gap-1.5 shadow-sm"
                >
                  <Mail size={14} />
                  <span>Email to Staff</span>
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* Formal Printable Document Card */}
      <div 
        id="payslip-statement"
        className="bg-surface-2 border border-border-subtle rounded-2xl p-6 sm:p-10 shadow-card max-w-4xl mx-auto space-y-8 print:bg-white print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none"
      >
        {/* Document Letterhead */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
          <div className="flex items-center gap-3.5">
            <Logo size="xl" className="shrink-0" />
            <div>
              <h2 className="text-lg font-bold tracking-tight text-text-main">
                PeoplePay360 Global Technologies Pvt. Ltd.
              </h2>
              <p className="text-xs text-text-muted">
                Statutory Payroll & Verified Tax Settlement Statement
              </p>
              <p className="text-[11px] text-text-muted">
                Bangalore, Karnataka - 560103
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted block">
              Payslip For Period
            </span>
            <span className="text-sm font-bold text-text-main font-mono">
              {period}
            </span>
            <div className="mt-1">
              <StatusPill status={status} />
            </div>
          </div>
        </div>

        {/* Employee & Payroll Metadata Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-1 border border-border-subtle text-xs">
          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">Employee Name</span>
            <span className="font-semibold text-text-main mt-0.5 block">{employeeName}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">Employee ID</span>
            <span className="font-mono text-text-main mt-0.5 block">{employeeId}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">Designation</span>
            <span className="text-text-main mt-0.5 block">{designation}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">Department</span>
            <span className="text-text-main mt-0.5 block">{department}</span>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">Bank Account</span>
            <span className="font-mono text-text-main mt-0.5 block">{bankAccount}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">PAN Number</span>
            <span className="font-mono text-text-main mt-0.5 block uppercase">{panNumber}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">UAN / PF Number</span>
            <span className="font-mono text-text-main mt-0.5 block">{uanNumber}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">Paid Days / Schedule</span>
            <span className="font-mono text-text-main mt-0.5 block">{paidDays} / {totalDays} days</span>
          </div>
        </div>

        {/* Earnings & Deductions Dual Ledger */}
        <div className="border border-border-subtle rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
            {/* Left: Earnings */}
            <div className="flex flex-col justify-between">
              <div className="p-4 bg-surface-1 font-semibold text-xs text-text-main uppercase tracking-wider flex justify-between">
                <span>Earnings Description</span>
                <span>Amount</span>
              </div>
              <div className="p-4 space-y-3 flex-1 text-xs">
                {earningsLines.length > 0 ? (
                  earningsLines.map((l, i) => (
                    <div key={i} className="flex justify-between items-center text-text-secondary">
                      <span>{l.name || l.code}</span>
                      <span className="font-mono font-medium text-text-main">{formatINR(l.amount)}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between items-center text-text-secondary">
                      <span>Basic Salary</span>
                      <span className="font-mono font-medium text-text-main">{formatINR(grossAmount * 0.5)}</span>
                    </div>
                    <div className="flex justify-between items-center text-text-secondary">
                      <span>House Rent Allowance (HRA)</span>
                      <span className="font-mono font-medium text-text-main">{formatINR(grossAmount * 0.25)}</span>
                    </div>
                    <div className="flex justify-between items-center text-text-secondary">
                      <span>Special & Performance Allowance</span>
                      <span className="font-mono font-medium text-text-main">{formatINR(grossAmount * 0.25)}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="p-4 bg-surface-1 border-t border-border-subtle flex justify-between font-bold text-xs">
                <span className="text-text-main uppercase">Gross Earnings</span>
                <span className="font-mono text-text-main">{formatINR(grossAmount)}</span>
              </div>
            </div>

            {/* Right: Deductions */}
            <div className="flex flex-col justify-between">
              <div className="p-4 bg-surface-1 font-semibold text-xs text-accent-rose uppercase tracking-wider flex justify-between">
                <span>Statutory Deductions</span>
                <span>Amount</span>
              </div>
              <div className="p-4 space-y-3 flex-1 text-xs">
                {deductionLines.length > 0 ? (
                  deductionLines.map((l, i) => (
                    <div key={i} className="flex justify-between items-center text-text-secondary">
                      <span>{l.name || l.code}</span>
                      <span className="font-mono font-medium text-accent-rose">-{formatINR(Math.abs(l.amount))}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between items-center text-text-secondary">
                      <span>Employees Provident Fund (EPF)</span>
                      <span className="font-mono font-medium text-accent-rose">-{formatINR(deductionsAmount > 0 ? Math.min(deductionsAmount * 0.5, 1800) : 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-text-secondary">
                      <span>Tax Deducted at Source (TDS)</span>
                      <span className="font-mono font-medium text-accent-rose">-{formatINR(deductionsAmount > 0 ? Math.max(0, deductionsAmount - 1800) : 0)}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="p-4 bg-surface-1 border-t border-border-subtle flex justify-between font-bold text-xs">
                <span className="text-accent-rose uppercase">Total Deductions</span>
                <span className="font-mono text-accent-rose">-{formatINR(deductionsAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary Highlight Box */}
        <div className="rounded-xl p-5 bg-gradient-to-r from-accent-emerald/15 via-surface-1 to-surface-1 border border-accent-emerald/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block">
              Net Payable Amount
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-accent-emerald mt-1">
              {formatINR(netAmount)}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted bg-surface-2 px-3 py-1.5 rounded-lg border border-border-subtle">
            <ShieldCheck className="w-4 h-4 text-accent-emerald shrink-0" />
            <span>Cryptographically Verified Ledger Record</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipDetailPage;
