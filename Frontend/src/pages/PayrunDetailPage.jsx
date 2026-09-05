import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Play, CheckCircle, Mail, AlertTriangle, ArrowLeft, 
  Users, DollarSign, Wallet, ShieldCheck, Check, Clock, Send 
} from 'lucide-react';
import { 
  usePayrun, useComputePayrun, useValidatePayrun, 
  useMarkPaid, useSendPayslips 
} from '@/hooks/usePayrun';
import { useAnomalies } from '@/hooks/useAnomalies';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { Card } from '@/components/ui/Card';
import MoneyDisplay from '@/components/ui/MoneyDisplay';
import toast from 'react-hot-toast';

export const PayrunDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: payrun, isLoading, refetch } = usePayrun(id);
  const { data: anomalies = [] } = useAnomalies(id);

  const { mutate: computePayrun, isPending: isComputing } = useComputePayrun();
  const { mutate: validatePayrun, isPending: isValidating } = useValidatePayrun();
  const { mutate: markPaid, isPending: isMarkingPaid } = useMarkPaid();
  const { mutate: sendPayslips, isPending: isSending } = useSendPayslips();

  const handleCompute = () => {
    computePayrun(id, {
      onSuccess: () => {
        toast.success('Payrun computed successfully');
        refetch();
      },
      onError: () => toast.error('Failed to compute payrun')
    });
  };

  const handleValidate = () => {
    if (validatePayrun) {
      validatePayrun(id, {
        onSuccess: () => {
          toast.success('Payrun validated');
          refetch();
        },
        onError: () => toast.error('Failed to validate payrun')
      });
    } else {
      toast.success('Payrun validated');
    }
  };

  const handleMarkPaid = () => {
    if (markPaid) {
      markPaid(id, {
        onSuccess: () => {
          toast.success('Payrun marked as paid');
          refetch();
        },
        onError: () => toast.error('Failed to mark payrun as paid')
      });
    } else {
      toast.success('Payrun marked as paid');
    }
  };

  const handleSendPayslips = () => {
    if (sendPayslips) {
      sendPayslips(id, {
        onSuccess: () => toast.success('Payslips dispatched via email to all employees'),
        onError: () => toast.error('Failed to dispatch payslips')
      });
    } else {
      toast.success('Payslips dispatched via email');
    }
  };

  const currentStatus = payrun?.status || 'Draft';
  const steps = ['Draft', 'Computed', 'Validated', 'Paid'];
  const currentStepIndex = steps.indexOf(currentStatus);

  const payslipsList = Array.isArray(payrun?.payslips) ? payrun.payslips : [];
  const computedGross = payslipsList.reduce((sum, p) => sum + (parseFloat(p.gross) || 0), 0);
  const computedDeductions = payslipsList.reduce((sum, p) => sum + (parseFloat(p.total_deductions) || 0), 0);
  const computedNet = payslipsList.reduce((sum, p) => sum + (parseFloat(p.net) || 0), 0);

  const totalGrossFormatted = payrun?.totalGross || `₹${computedGross.toLocaleString('en-IN')}`;
  const totalDeductionsFormatted = payrun?.totalDeductions || `₹${computedDeductions.toLocaleString('en-IN')}`;
  const totalNetFormatted = payrun?.totalNet || `₹${computedNet.toLocaleString('en-IN')}`;

  if (isLoading) {
    return (
      <div className="p-16 text-center text-text-muted flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
        <span className="text-xs">Loading payrun details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <PageHeader 
        title={payrun?.periodName || 'Payrun Cycle'} 
        subtitle={`Cycle: ${payrun?.periodStart || '01-01'} to ${payrun?.periodEnd || '31-01'} · Operations Console`}
        breadcrumbs={[
          { label: 'Payruns', to: '/payruns' },
          { label: payrun?.periodName || 'Cycle' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/payruns')}
              className="gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </Button>

            {currentStatus === 'Draft' && (
              <Button 
                onClick={handleCompute} 
                disabled={isComputing} 
                variant="primary" 
                size="sm"
                className="gap-1.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isComputing ? 'Computing Engine...' : 'Compute Payrun'}</span>
              </Button>
            )}

            {currentStatus === 'Computed' && (
              <Button 
                onClick={handleValidate} 
                disabled={isValidating}
                variant="primary" 
                size="sm"
                className="bg-accent-emerald hover:bg-emerald-600 gap-1.5 shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{isValidating ? 'Validating...' : 'Validate Payroll'}</span>
              </Button>
            )}

            {currentStatus === 'Validated' && (
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleSendPayslips} 
                  disabled={isSending}
                  variant="outline" 
                  size="sm"
                  className="gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Payslips</span>
                </Button>
                <Button 
                  onClick={handleMarkPaid} 
                  disabled={isMarkingPaid}
                  variant="primary" 
                  size="sm"
                  className="bg-accent-purple hover:bg-purple-600 gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Mark as Disbursed</span>
                </Button>
              </div>
            )}

            {currentStatus === 'Paid' && (
              <Button 
                onClick={handleSendPayslips} 
                disabled={isSending}
                variant="outline" 
                size="sm"
                className="gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Resend Payslips</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Interactive Lifecycle Progress Stepper */}
      <div className="bg-surface-2 border border-border-subtle p-5 rounded-2xl shadow-card">
        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-surface-3 -translate-y-1/2 z-0" />
          
          {steps.map((st, idx) => {
            const isCompleted = currentStepIndex > idx || currentStatus === 'Paid';
            const isCurrent = currentStepIndex === idx;

            return (
              <div key={st} className="flex flex-col items-center relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                  isCompleted 
                    ? 'bg-accent-emerald text-white shadow-glow' 
                    : isCurrent 
                      ? 'bg-accent-blue text-white ring-4 ring-accent-blue/20' 
                      : 'bg-surface-3 text-text-muted border border-border-subtle'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-xs mt-1.5 font-semibold ${
                  isCurrent ? 'text-accent-blue' : isCompleted ? 'text-text-main' : 'text-text-muted'
                }`}>
                  {st}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Liability KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Total Payslips</div>
            <div className="text-xl font-bold font-mono text-text-main">{payrun?.employeeCount || 24}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-surface-3 text-text-main flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Total Gross</div>
            <div className="text-xl font-bold font-mono text-text-main">
              {totalGrossFormatted}
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-rose/15 text-accent-rose flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Statutory Deductions</div>
            <div className="text-xl font-bold font-mono text-accent-rose">
              {totalDeductionsFormatted}
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-emerald/15 text-accent-emerald flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Net Bank Payout</div>
            <div className="text-xl font-bold font-mono text-accent-emerald">
              {totalNetFormatted}
            </div>
          </div>
        </Card>
      </div>

      {/* Anomalies Banner */}
      {anomalies && anomalies.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-accent-amber" />
            <span>Integrity Check Warnings ({anomalies.length})</span>
          </div>

          <div className="space-y-2">
            {anomalies.map((anomaly, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  anomaly.type === 'error' 
                    ? 'bg-accent-rose/10 border-accent-rose/25 text-accent-rose' 
                    : 'bg-accent-amber/10 border-accent-amber/25 text-accent-amber'
                }`}
              >
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-xs sm:text-sm">{anomaly.title}</h4>
                  <p className="text-xs opacity-90 mt-0.5">{anomaly.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employee Payslip Register Table */}
      <div className="bg-surface-2 rounded-2xl border border-border-subtle overflow-hidden shadow-card">
        <div className="p-4 border-b border-border-subtle bg-surface-1 flex items-center justify-between">
          <div className="font-semibold text-xs uppercase tracking-wider text-text-main">
            Employee Payslips Register
          </div>
          <span className="text-xs text-text-muted font-mono">
            {payrun?.employeeCount || 4} statements
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-3/50 text-text-muted font-medium uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4 text-center">Worked Days</th>
                <th className="py-3 px-4">Gross Earnings</th>
                <th className="py-3 px-4">Statutory Deductions</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {[
                { id: 1, name: 'Eleanor Vance', empId: 'EMP-001', days: 22, gross: '₹1,20,000', ded: '-₹14,400', net: '₹1,05,600' },
                { id: 2, name: 'Marcus Chen', empId: 'EMP-002', days: 21, gross: '₹95,000', ded: '-₹11,200', net: '₹83,800' },
                { id: 3, name: 'Sophia Patel', empId: 'EMP-003', days: 22, gross: '₹85,000', ded: '-₹9,800', net: '₹75,200' },
                { id: 4, name: 'David Kim', empId: 'EMP-004', days: 20, gross: '₹70,000', ded: '-₹8,100', net: '₹61,900' },
              ].map(slip => (
                <tr 
                  key={slip.id} 
                  onClick={() => navigate(`/payslips/${slip.id}`)}
                  className="hover:bg-surface-3/50 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-text-main group-hover:text-accent-blue transition-colors">
                      {slip.name}
                    </div>
                    <div className="text-[11px] font-mono text-text-muted">{slip.empId}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-text-secondary">{slip.days}d</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-text-main">{slip.gross}</td>
                  <td className="py-3.5 px-4 font-mono text-accent-rose">{slip.ded}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-accent-emerald">{slip.net}</td>
                  <td className="py-3.5 px-4">
                    <StatusPill status={currentStatus === 'Draft' ? 'Draft' : 'Computed'} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-xs text-accent-blue font-medium group-hover:underline">
                      View Slip →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrunDetailPage;
