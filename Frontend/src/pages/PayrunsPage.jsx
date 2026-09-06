import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Play, Calendar, Users, ArrowRight, CheckCircle2, 
  Clock, ShieldCheck, Wallet, Sparkles, Filter 
} from 'lucide-react';
import { usePayruns } from '@/hooks/usePayrun';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { Card } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import MoneyDisplay from '@/components/ui/MoneyDisplay';
import { PayrunWizard } from '@/components/payrun/PayrunWizard';
import useAuthStore from '@/store/authStore';

export const PayrunsPage = () => {
  const navigate = useNavigate();
  const { data: payruns = [], isLoading, isError } = usePayruns();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredPayruns = payruns.filter(p => {
    if (statusFilter === 'All') return true;
    return (p.status || '').toLowerCase() === statusFilter.toLowerCase();
  });

  const draftCount = payruns.filter(p => (p.status || '').toLowerCase() === 'draft').length;
  const computedCount = payruns.filter(p => (p.status || '').toLowerCase() === 'computed').length;
  const validatedCount = payruns.filter(p => (p.status || '').toLowerCase() === 'validated').length;
  const paidCount = payruns.filter(p => (p.status || '').toLowerCase() === 'paid').length;
  const user = useAuthStore(s => s.user);
  const role = (user?.role || '').toUpperCase();
  const canManage = role === 'ADMIN' || role === 'HR';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <PageHeader 
        title="Payroll Cycles & Payruns" 
        subtitle="Orchestrate monthly payroll computation, tax statutory deductions, and automated direct deposits"
        breadcrumbs={[
          { label: 'Payroll', to: '/payruns' },
          { label: 'Payruns' }
        ]}
        actions={
          canManage && (
            <Button 
              onClick={() => setIsWizardOpen(true)} 
              variant="primary" 
              size="sm"
              className="gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Payrun Cycle</span>
            </Button>
          )
        }
      />

      {/* 4-Stage Lifecycle Stepper Banner */}
      <div className="bg-surface-2 border border-border-subtle p-4 rounded-xl shadow-card">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Pipeline Stages:
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto w-full sm:w-auto text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-3 border border-border-subtle shrink-0">
              <span className="w-2 h-2 rounded-full bg-accent-amber" />
              <span className="text-text-secondary font-medium">1. Draft</span>
              <span className="font-mono text-text-muted text-[11px]">({draftCount})</span>
            </div>
            <span className="text-text-muted">→</span>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-3 border border-border-subtle shrink-0">
              <span className="w-2 h-2 rounded-full bg-accent-blue" />
              <span className="text-text-secondary font-medium">2. Computed</span>
              <span className="font-mono text-text-muted text-[11px]">({computedCount})</span>
            </div>
            <span className="text-text-muted">→</span>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-3 border border-border-subtle shrink-0">
              <span className="w-2 h-2 rounded-full bg-accent-purple" />
              <span className="text-text-secondary font-medium">3. Validated</span>
              <span className="font-mono text-text-muted text-[11px]">({validatedCount})</span>
            </div>
            <span className="text-text-muted">→</span>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-3 border border-border-subtle shrink-0">
              <span className="w-2 h-2 rounded-full bg-accent-emerald" />
              <span className="text-text-secondary font-medium">4. Disbursed</span>
              <span className="font-mono text-text-muted text-[11px]">({paidCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-surface-2 p-1 rounded-lg border border-border-subtle">
          {['All', 'Draft', 'Computed', 'Validated', 'Paid'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-surface-1 text-accent-blue shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="p-16 text-center text-text-muted flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
          <span className="text-xs">Loading payroll cycles...</span>
        </div>
      ) : !filteredPayruns.length ? (
        <EmptyState 
          icon={Play}
          title="No payruns found"
          description={statusFilter !== 'All' ? `No payruns currently in ${statusFilter} state.` : "Create your first payrun to begin calculating salaries."}
          actionLabel={canManage ? "Create Payrun Cycle" : undefined}
          onAction={canManage ? () => setIsWizardOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPayruns.map((payrun) => {
            const amountNum = typeof payrun.totalAmount === 'number' 
              ? payrun.totalAmount 
              : parseFloat(String(payrun.totalAmount || '0').replace(/[^0-9.-]+/g, '')) || 0;

            return (
              <Card 
                key={payrun.id}
                onClick={() => navigate(`/payruns/${payrun.id}`)}
                className="p-5 cursor-pointer hover:border-accent-blue/50 transition-all duration-150 hover:-translate-y-1 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                        Pay Period
                      </span>
                      <h3 className="text-base font-bold text-text-main group-hover:text-accent-blue transition-colors">
                        {payrun.periodName}
                      </h3>
                    </div>
                    <StatusPill status={payrun.status || 'Draft'} />
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-text-muted mt-2 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span>{payrun.periodStart && payrun.periodEnd ? `${payrun.periodStart} → ${payrun.periodEnd}` : 'Standard Monthly Cycle'}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border-subtle">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-[11px] text-text-muted flex items-center gap-1 mb-0.5">
                        <Users className="w-3.5 h-3.5 text-text-muted" />
                        <span>Roster</span>
                      </div>
                      <div className="text-xs font-mono font-semibold text-text-main">
                        {payrun.employeeCount || 0} employees
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted flex items-center gap-1 mb-0.5">
                        <Wallet className="w-3.5 h-3.5 text-text-muted" />
                        <span>Net Liability</span>
                      </div>
                      <div className="text-xs font-semibold">
                        {amountNum > 0 ? <MoneyDisplay amount={amountNum} /> : <span className="text-text-muted font-mono">—</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-accent-blue font-medium pt-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {isWizardOpen && (
        <PayrunWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
      )}
    </div>
  );
};

export default PayrunsPage;
