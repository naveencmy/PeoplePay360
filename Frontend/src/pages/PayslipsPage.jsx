import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Eye, Filter } from 'lucide-react';
import { usePayslips } from '@/hooks/usePayslips';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';

export const PayslipsPage = () => {
  const navigate = useNavigate();
  const { data: payslips, isLoading } = usePayslips({});

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Payslips" subtitle="View and manage employee payslips" />
        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-gray-300">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="bg-[#161B22] rounded-lg border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading payslips...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm bg-white/5">
                <th className="p-4 font-medium">Employee</th>
                <th className="p-4 font-medium">Structure</th>
                <th className="p-4 font-medium">Period</th>
                <th className="p-4 font-medium">Gross</th>
                <th className="p-4 font-medium">Net</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(id => (
                <tr key={id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-gray-300">
                  <td className="p-4">
                    <div className="font-medium text-white">Employee {id}</div>
                    <div className="text-xs text-gray-500">EMP-00{id}</div>
                  </td>
                  <td className="p-4 text-sm">Regular Full-time</td>
                  <td className="p-4 text-sm">March 2026</td>
                  <td className="p-4 text-gray-200">$5,000.00</td>
                  <td className="p-4 font-medium text-green-400">$4,500.00</td>
                  <td className="p-4">
                    <StatusPill status="Paid" />
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => navigate(`/payslips/${id}`)}
                      className="p-2 text-gray-400 hover:text-white rounded hover:bg-white/10 transition-colors inline-flex"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-[#4F7CFF] rounded hover:bg-white/10 transition-colors inline-flex"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PayslipsPage;
