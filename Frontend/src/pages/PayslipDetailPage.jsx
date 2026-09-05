import React from 'react';
import { useParams } from 'react-router-dom';
import { Download, Mail, Building2, User } from 'lucide-react';
import { usePayslip, useGeneratePDF } from '@/hooks/usePayslips';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';

export const PayslipDetailPage = () => {
  const { id } = useParams();
  const { data: payslip, isLoading } = usePayslip(id);
  const { mutate: generatePDF } = useGeneratePDF();

  if (isLoading || !payslip) {
    return <div className="p-8 text-center text-gray-400">Loading payslip from database...</div>;
  }

  const initials = payslip.employeeName
    ? payslip.employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'EM';

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 bg-gradient-to-br from-[#4F7CFF] to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{payslip.employeeName}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              <span>Regular Contract</span>
              <span>•</span>
              <span>{payslip.periodName}</span>
              <span>•</span>
              <span>{payslip.workedDays} Worked Days</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <StatusPill status={payslip.status || 'Paid'} />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-white/10 hover:bg-white/5 min-h-[44px]" 
              onClick={() => generatePDF(id)}
              aria-label="Download payslip PDF"
            >
              <Download className="w-4 h-4 mr-2" aria-hidden="true" /> PDF
            </Button>
            <Button 
              className="bg-[#4F7CFF] hover:bg-blue-600 min-h-[44px]"
              aria-label="Email payslip to employee"
            >
              <Mail className="w-4 h-4 mr-2" aria-hidden="true" /> Email
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section aria-labelledby="company-info-heading" className="bg-[#161B22] border border-white/10 rounded-xl p-6 space-y-4">
          <h2 id="company-info-heading" className="flex items-center gap-2 text-white font-medium mb-4 border-b border-white/10 pb-4">
            <Building2 className="w-4 h-4 text-gray-400" aria-hidden="true" /> Company Information
          </h2>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div className="text-gray-400">Organization</div>
            <div className="text-white font-medium text-right">PeoplePay360 Inc.</div>
            <div className="text-gray-400">Payroll Structure</div>
            <div className="text-white font-medium text-right">{payslip.structureName}</div>
            <div className="text-gray-400">Pay Period</div>
            <div className="text-white font-medium text-right">{payslip.periodName}</div>
          </div>
        </section>

        <section aria-labelledby="employee-info-heading" className="bg-[#161B22] border border-white/10 rounded-xl p-6 space-y-4">
          <h2 id="employee-info-heading" className="flex items-center gap-2 text-white font-medium mb-4 border-b border-white/10 pb-4">
            <User className="w-4 h-4 text-gray-400" aria-hidden="true" /> Employee Information
          </h2>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div className="text-gray-400">Employee ID</div>
            <div className="text-white font-medium text-right">{payslip.employeeId}</div>
            <div className="text-gray-400">Department</div>
            <div className="text-white font-medium text-right">{payslip.department}</div>
            <div className="text-gray-400">Bank Account</div>
            <div className="text-white font-medium text-right">{payslip.bankAccount}</div>
          </div>
        </section>
      </div>

      <section aria-labelledby="breakdown-heading" className="bg-[#161B22] border border-white/10 rounded-xl overflow-hidden">
        <h2 id="breakdown-heading" className="p-4 bg-white/5 border-b border-white/10 text-white font-medium">
          Earnings & Deductions Breakdown
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* Earnings */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Earnings</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Basic Salary (40%)</span>
                <span className="text-white font-medium">{payslip.basicSalary}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">House Rent Allowance (HRA)</span>
                <span className="text-white font-medium">{payslip.hra}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Special Allowance</span>
                <span className="text-white font-medium">{payslip.specialAllowance}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between font-medium">
              <span className="text-gray-400">Total Earnings (Gross)</span>
              <span className="text-white">{payslip.totalEarnings}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Statutory Deductions</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Provident Fund (PF - 12%)</span>
                <span className="text-red-400 font-medium">-{payslip.providentFund}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Professional Tax (PT)</span>
                <span className="text-red-400 font-medium">-{payslip.professionalTax}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between font-medium">
              <span className="text-gray-400">Total Deductions</span>
              <span className="text-red-400">-{payslip.totalDeductions}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#0B0D10] border-t border-white/10 flex items-center justify-between">
          <div>
            <div className="text-gray-400 uppercase text-xs font-bold tracking-wider">Net Payable Salary</div>
            <div className="text-sm text-gray-400 mt-1">Directly credited to verified bank account</div>
          </div>
          <div className="text-3xl font-bold text-[#4F7CFF] bg-[#4F7CFF]/10 px-6 py-3 rounded-lg border border-[#4F7CFF]/20">
            {payslip.netPay}
          </div>
        </div>
      </section>
    </main>
  );
};

export default PayslipDetailPage;
