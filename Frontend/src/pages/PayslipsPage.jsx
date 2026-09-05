import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Download, Eye, Filter, Search, Wallet, 
  CheckCircle2, Clock, ArrowRight 
} from 'lucide-react';
import { usePayslips } from '@/hooks/usePayslips';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import MoneyDisplay from '@/components/ui/MoneyDisplay';
import EmptyState from '@/components/ui/EmptyState';

export const PayslipsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { data: payslips = [], isLoading } = usePayslips({});

  // 100% Live PostgreSQL Data
  const sampleSlips = payslips || [];

  const filteredSlips = sampleSlips.filter(s => {
    const matchesSearch = !search || 
      (s.employeeName && s.employeeName.toLowerCase().includes(search.toLowerCase())) ||
      (s.employeeId && s.employeeId.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || 
      (s.status && s.status.toLowerCase() === statusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  const totalPaidSum = sampleSlips
    .filter(s => (s.status || '').toLowerCase() === 'paid')
    .reduce((sum, s) => sum + (Number(s.net) || 0), 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <PageHeader 
        title="Payslips & Statements" 
        subtitle="Access individualized salary breakdowns, tax withholding statements, and verifiable digital receipts"
        breadcrumbs={[
          { label: 'Payroll', to: '/payruns' },
          { label: 'Payslips' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1.5"
              onClick={() => window.print()}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / Bulk Export</span>
            </Button>
          </div>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Generated Slips</div>
            <div className="text-xl font-bold font-mono text-text-main">{sampleSlips.length}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-emerald/15 text-accent-emerald flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Total Disbursed (Cycle)</div>
            <div className="text-xl font-bold text-text-main">
              <MoneyDisplay amount={totalPaidSum} />
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Pending Delivery</div>
            <div className="text-xl font-bold font-mono text-text-main">
              {sampleSlips.filter(s => s.status !== 'Paid').length}
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-2 p-3.5 rounded-xl border border-border-subtle shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <Input 
              placeholder="Search employee or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface-3 border-border-subtle text-xs h-9"
            />
          </div>

          <Select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 bg-surface-3 border-border-subtle text-xs h-9"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Computed">Computed</option>
            <option value="Draft">Draft</option>
          </Select>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="bg-surface-2 rounded-2xl border border-border-subtle overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-16 text-center text-text-muted flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
            <span className="text-xs">Loading payslips register...</span>
          </div>
        ) : !filteredSlips.length ? (
          <EmptyState 
            icon={FileText}
            title="No payslips match your query"
            description="Try selecting a different status or searching by another employee name."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-1 text-text-muted font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Salary Structure</th>
                  <th className="py-3 px-4">Cycle</th>
                  <th className="py-3 px-4 text-right">Gross Pay</th>
                  <th className="py-3 px-4 text-right">Net Take-Home</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredSlips.map(slip => (
                  <tr 
                    key={slip.id} 
                    onClick={() => navigate(`/payslips/${slip.id}`)}
                    className="hover:bg-surface-3/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-text-main group-hover:text-accent-blue transition-colors">
                        {slip.employeeName}
                      </div>
                      <div className="text-[11px] font-mono text-text-muted">{slip.employeeId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary">
                      <span className="px-2 py-0.5 rounded bg-surface-3 border border-border-subtle font-mono text-[11px]">
                        {slip.structure}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-text-muted">{slip.period}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-text-secondary">
                      <MoneyDisplay amount={slip.gross} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-accent-emerald">
                      <MoneyDisplay amount={slip.net} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusPill status={slip.status || 'Paid'} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/payslips/${slip.id}`); }}
                        className="p-1.5 text-text-muted hover:text-accent-blue rounded-lg hover:bg-surface-3 transition-colors inline-flex"
                        title="View Statement"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/payslips/${slip.id}?download=pdf`); }}
                        className="p-1.5 text-text-muted hover:text-accent-blue rounded-lg hover:bg-surface-3 transition-colors inline-flex"
                        title="Download Paystub"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayslipsPage;
