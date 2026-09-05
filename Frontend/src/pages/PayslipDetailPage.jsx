import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Mail, ArrowLeft, Building2, User, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { usePayslip, useGeneratePDF } from '@/hooks/usePayslips';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import MoneyDisplay from '@/components/ui/MoneyDisplay';
import PageHeader from '@/components/layout/PageHeader';
import toast from 'react-hot-toast';

export const PayslipDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: payslip, isLoading } = usePayslip(id);
  const { mutate: generatePDF } = useGeneratePDF();

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    toast.success('Payslip copy emailed to employee');
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      <PageHeader 
        title="Salary Statement" 
        subtitle="Confidential Monthly Compensation & Tax Withholding Summary"
        breadcrumbs={[
          { label: 'Payroll', to: '/payruns' },
          { label: 'Payslips', to: '/payslips' },
          { label: `Statement #${id}` }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/payslips')}
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
              <span>Print / PDF</span>
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleEmail}
              className="gap-1.5 shadow-sm"
            >
              <Mail size={14} />
              <span>Email to Staff</span>
            </Button>
          </div>
        }
      />

      {/* Formal Printable Document Card */}
      <div className="bg-surface-2 border border-border-subtle rounded-2xl p-6 sm:p-10 shadow-card max-w-4xl mx-auto space-y-8">
        {/* Document Letterhead */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accent-blue to-accent-cyan p-0.5 shadow-sm">
              <div className="w-full h-full bg-surface-1 rounded-[10px] flex items-center justify-center font-bold text-base text-accent-blue font-mono">
                P3
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-text-main">
                PeoplePay360 Global Technologies Pvt. Ltd.
              </h2>
              <p className="text-xs text-text-muted">
                CIN: U72200KA2024PTC123456 · GSTIN: 29AAACP1234F1Z8
              </p>
              <p className="text-[11px] text-text-muted">
                Embassy TechVillage, Outer Ring Road, Bangalore - 560103
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted block">
              Payslip For Period
            </span>
            <span className="text-sm font-bold text-text-main font-mono">
              October 2026
            </span>
            <div className="mt-1">
              <StatusPill status={payslip?.status || 'Paid'} />
            </div>
          </div>
        </div>

        {/* Employee & Payroll Metadata Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-1 border border-border-subtle text-xs">
          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">Employee Name</span>
            <span className="font-semibold text-text-main mt-0.5 block">{payslip?.employeeName || 'Eleanor Vance'}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">Employee ID</span>
            <span className="font-mono text-text-main mt-0.5 block">{payslip?.employeeId || 'EMP-001'}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">Designation</span>
            <span className="text-text-main mt-0.5 block">{payslip?.jobPosition || 'Lead Software Engineer'}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">Department</span>
            <span className="text-text-main mt-0.5 block">{payslip?.department || 'Core Engineering'}</span>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">Bank Account</span>
            <span className="font-mono text-text-main mt-0.5 block">HDFC ·••• 4821</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">PAN Number</span>
            <span className="font-mono text-text-main mt-0.5 block uppercase">ABCDE1234F</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">UAN / PF Number</span>
            <span className="font-mono text-text-main mt-0.5 block">100987654321</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-text-muted block">Paid Days / LOP</span>
            <span className="font-mono text-text-main mt-0.5 block">30 / 0 days</span>
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
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Basic Salary (50% of CTC)</span>
                  <span className="font-mono font-medium text-text-main">₹60,000.00</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="font-mono font-medium text-text-main">₹30,000.00</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Special Allowance</span>
                  <span className="font-mono font-medium text-text-main">₹20,000.00</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Conveyance & Telecom</span>
                  <span className="font-mono font-medium text-text-main">₹10,000.00</span>
                </div>
              </div>
              <div className="p-4 bg-surface-1 border-t border-border-subtle flex justify-between font-bold text-xs">
                <span className="text-text-main uppercase">Gross Earnings</span>
                <span className="font-mono text-text-main">₹1,20,000.00</span>
              </div>
            </div>

            {/* Right: Deductions */}
            <div className="flex flex-col justify-between">
              <div className="p-4 bg-surface-1 font-semibold text-xs text-accent-rose uppercase tracking-wider flex justify-between">
                <span>Statutory Deductions</span>
                <span>Amount</span>
              </div>
              <div className="p-4 space-y-3 flex-1 text-xs">
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Employees Provident Fund (EPF)</span>
                  <span className="font-mono font-medium text-accent-rose">₹7,200.00</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Professional Tax (PT)</span>
                  <span className="font-mono font-medium text-accent-rose">₹200.00</span>
                </div>
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Tax Deducted at Source (TDS)</span>
                  <span className="font-mono font-medium text-accent-rose">₹7,000.00</span>
                </div>
              </div>
              <div className="p-4 bg-surface-1 border-t border-border-subtle flex justify-between font-bold text-xs">
                <span className="text-accent-rose uppercase">Total Deductions</span>
                <span className="font-mono text-accent-rose">₹14,400.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary Highlight Box */}
        <div className="rounded-xl p-5 bg-gradient-to-r from-accent-emerald/15 via-surface-1 to-surface-1 border border-accent-emerald/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
              Net Take-Home Salary Transferred
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-accent-emerald tracking-tight mt-1">
              ₹1,05,600.00
            </div>
            <div className="text-xs text-text-muted mt-1 italic">
              Amount in words: One Lakh Five Thousand Six Hundred Rupees Only
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-2 border border-border-subtle text-right">
            <span className="text-[11px] text-text-muted flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
              Direct Deposit Verified
            </span>
            <span className="text-xs font-mono text-text-secondary mt-0.5 block">
              UTR: HDFC2026103099812
            </span>
          </div>
        </div>

        {/* Legal & Engine Disclaimer */}
        <div className="pt-4 border-t border-border-subtle text-center text-[11px] text-text-muted">
          <p>
            This is a system-generated compensation statement issued by PeoplePay360 Payroll Engine. No physical signature required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayslipDetailPage;
