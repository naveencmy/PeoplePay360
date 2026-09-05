import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, CheckCircle, Mail, AlertTriangle } from 'lucide-react';
import { usePayrun, useComputePayrun, useValidatePayrun, useMarkPaid, useSendPayslips } from '@/hooks/usePayrun';
import { useAnomalies } from '@/hooks/useAnomalies';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';

export const PayrunDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: payrun, isLoading } = usePayrun(id);
  const { data: anomalies } = useAnomalies(id);
  const { mutate: computePayrun, isPending: isComputing } = useComputePayrun();

  const handleAction = () => {
    if (payrun?.status === 'Draft') {
      computePayrun(id);
    }
  };

  const getActionButton = () => {
    switch(payrun?.status) {
      case 'Draft':
        return (
          <Button onClick={handleAction} disabled={isComputing} className="bg-[#4F7CFF] hover:bg-blue-600">
            <Play className="w-4 h-4 mr-2" />
            {isComputing ? 'Computing...' : 'Compute Payroll'}
          </Button>
        );
      case 'Computed':
        return (
          <Button className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Validate
          </Button>
        );
      case 'Validated':
        return (
          <div className="flex gap-3">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              <Mail className="w-4 h-4 mr-2" /> Send Payslips
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Mark as Paid
            </Button>
          </div>
        );
      case 'Paid':
        return (
          <Button variant="outline" className="border-white/10 hover:bg-white/5">
            <Mail className="w-4 h-4 mr-2" /> Send Payslips
          </Button>
        );
      default:
        return null;
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-400">Loading payrun details...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <PageHeader title={payrun?.periodName || 'March 2026'} />
          <StatusPill status={payrun?.status || 'Draft'} />
        </div>
        <div className="flex items-center gap-3">
          {getActionButton()}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#161B22] p-4 rounded-lg border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Employees</div>
          <div className="text-2xl font-semibold text-white">{payrun?.employeeCount || 0}</div>
        </div>
        <div className="bg-[#161B22] p-4 rounded-lg border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Total Gross</div>
          <div className="text-2xl font-semibold text-white">{payrun?.totalGross || '$0.00'}</div>
        </div>
        <div className="bg-[#161B22] p-4 rounded-lg border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Total Deductions</div>
          <div className="text-2xl font-semibold text-white">{payrun?.totalDeductions || '$0.00'}</div>
        </div>
        <div className="bg-[#161B22] p-4 rounded-lg border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Net Pay</div>
          <div className="text-2xl font-semibold text-[#4F7CFF]">{payrun?.totalNet || '$0.00'}</div>
        </div>
      </div>

      {anomalies && anomalies.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">Warnings & Anomalies</h3>
          {anomalies.map((anomaly, idx) => (
            <div key={idx} className={`p-4 rounded-lg border flex items-start gap-3 ${anomaly.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">{anomaly.title}</h4>
                <p className="text-sm opacity-80 mt-1">{anomaly.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#161B22] rounded-lg border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5 font-medium text-white">
          Payslips
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-sm bg-[#0B0D10]">
              <th className="p-4 font-medium">Employee</th>
              <th className="p-4 font-medium">Worked Days</th>
              <th className="p-4 font-medium">Gross</th>
              <th className="p-4 font-medium">Deductions</th>
              <th className="p-4 font-medium">Net Pay</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map(payslipId => (
              <tr 
                key={payslipId} 
                onClick={() => navigate(`/payslips/${payslipId}`)}
                className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors text-gray-300"
              >
                <td className="p-4">
                  <div className="font-medium text-white">Jane Doe {payslipId}</div>
                  <div className="text-xs text-gray-500">EMP-00{payslipId}</div>
                </td>
                <td className="p-4">22</td>
                <td className="p-4 text-gray-200">$5,000.00</td>
                <td className="p-4 text-red-400">-$500.00</td>
                <td className="p-4 font-medium text-green-400">$4,500.00</td>
                <td className="p-4">
                  <StatusPill status={payrun?.status === 'Draft' ? 'Draft' : 'Computed'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrunDetailPage;
