import React from 'react';
import { useParams } from 'react-router-dom';
import { Download, Mail, AlertCircle, Building2, User } from 'lucide-react';
import { usePayslip, useGeneratePDF } from '@/hooks/usePayslips';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';

export const PayslipDetailPage = () => {
  const { id } = useParams();
  const { data: payslip, isLoading } = usePayslip(id);
  const { mutate: generatePDF } = useGeneratePDF();

  const hasAnomaly = false; // Mock

  if (isLoading) return <div className="p-8 text-center text-gray-400">Loading payslip...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#4F7CFF] to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            JD
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Jane Doe</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              <span>Regular Full-time</span>
              <span>•</span>
              <span>March 2026</span>
              <span>•</span>
              <span>22 Worked Days</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <StatusPill status="Paid" />
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => generatePDF(id)}>
              <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
            <Button className="bg-[#4F7CFF] hover:bg-blue-600">
              <Mail className="w-4 h-4 mr-2" /> Email
            </Button>
          </div>
        </div>
      </div>

      {hasAnomaly && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-amber-400 font-medium">Anomaly Detected</h3>
            <p className="text-amber-400/80 text-sm mt-1">Net pay differs significantly from previous month.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#161B22] border border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="flex items-center gap-2 text-white font-medium mb-4 border-b border-white/10 pb-4">
            <Building2 className="w-4 h-4 text-gray-400" /> Company Info
          </h3>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div className="text-gray-500">Company Name</div>
            <div className="text-white font-medium text-right">Acme Corp</div>
            <div className="text-gray-500">Address</div>
            <div className="text-white font-medium text-right">123 Business Rd, Tech City</div>
            <div className="text-gray-500">Tax ID</div>
            <div className="text-white font-medium text-right">TAX-987654321</div>
          </div>
        </div>

        <div className="bg-[#161B22] border border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="flex items-center gap-2 text-white font-medium mb-4 border-b border-white/10 pb-4">
            <User className="w-4 h-4 text-gray-400" /> Employee Info
          </h3>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div className="text-gray-500">Employee ID</div>
            <div className="text-white font-medium text-right">EMP-001</div>
            <div className="text-gray-500">Department</div>
            <div className="text-white font-medium text-right">Engineering</div>
            <div className="text-gray-500">Bank Account</div>
            <div className="text-white font-medium text-right">**** 5678</div>
          </div>
        </div>
      </div>

      <div className="bg-[#161B22] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 bg-white/5 border-b border-white/10 text-white font-medium">
          Earnings & Deductions
        </div>
        
        <div className="grid grid-cols-2 divide-x divide-white/10">
          {/* Earnings */}
          <div className="p-6 space-y-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Earnings</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Basic Salary</span>
                <span className="text-white font-medium">$3,000.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">House Rent Allowance</span>
                <span className="text-white font-medium">$1,200.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Special Allowance</span>
                <span className="text-white font-medium">$800.00</span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between font-medium">
              <span className="text-gray-400">Total Earnings</span>
              <span className="text-white">$5,000.00</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="p-6 space-y-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Deductions</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Provident Fund</span>
                <span className="text-red-400 font-medium">-$360.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Professional Tax</span>
                <span className="text-red-400 font-medium">-$140.00</span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between font-medium">
              <span className="text-gray-400">Total Deductions</span>
              <span className="text-red-400">-$500.00</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#0B0D10] border-t border-white/10 flex items-center justify-between">
          <div>
            <div className="text-gray-500 uppercase text-xs font-bold tracking-wider">Net Pay</div>
            <div className="text-sm text-gray-400 mt-1">Amount to be transferred to bank</div>
          </div>
          <div className="text-3xl font-bold text-[#4F7CFF] bg-[#4F7CFF]/10 px-6 py-3 rounded-lg border border-[#4F7CFF]/20">
            $4,500.00
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipDetailPage;
