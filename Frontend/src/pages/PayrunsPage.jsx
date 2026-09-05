import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Calendar, Users, DollarSign } from 'lucide-react';
import { usePayruns } from '@/hooks/usePayrun';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { PayrunWizard } from '@/components/payrun/PayrunWizard';

export const PayrunsPage = () => {
  const navigate = useNavigate();
  const { data: payruns, isLoading } = usePayruns();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="Payruns" 
        subtitle="Manage payroll processing cycles"
        action={
          <Button onClick={() => setIsWizardOpen(true)} className="bg-[#4F7CFF] hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            New Payrun
          </Button>
        }
      />

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading payruns...</div>
      ) : !payruns?.length ? (
        <div className="bg-[#161B22] border border-white/10 rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-white/5 p-4 rounded-full mb-4">
            <Play className="w-8 h-8 text-gray-400 ml-1" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No payruns yet</h3>
          <p className="text-gray-400 mb-6">Create your first payrun to start processing payroll.</p>
          <Button onClick={() => setIsWizardOpen(true)} className="bg-[#4F7CFF] hover:bg-blue-600">
            Create your first payrun
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Example grouping by year/month could be implemented here. For now, flat list of cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {payruns.map((payrun) => (
              <div 
                key={payrun.id}
                onClick={() => navigate(`/payruns/${payrun.id}`)}
                className="bg-[#161B22] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all cursor-pointer group hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#4F7CFF] transition-colors">{payrun.periodName}</h3>
                    <div className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {payrun.periodStart} - {payrun.periodEnd}
                    </div>
                  </div>
                  <StatusPill status={payrun.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/5">
                  <div>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Employees</div>
                    <div className="text-sm font-medium text-gray-200">{payrun.employeeCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Total Amount</div>
                    <div className="text-sm font-medium text-gray-200">{payrun.totalAmount || '-'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isWizardOpen && (
        <PayrunWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
      )}
    </div>
  );
};

export default PayrunsPage;
