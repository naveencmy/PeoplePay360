import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, FileText, CheckCircle2, AlertTriangle, Wallet, Calendar, User } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import StatusPill from '@/components/ui/StatusPill';
import { Card } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import MoneyDisplay from '@/components/ui/MoneyDisplay';
import { useContracts } from '@/hooks/useContracts';
import ContractFormModal from '@/components/contract/ContractFormModal';

export default function ContractsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeId = searchParams.get('employee_id');
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const { data: contracts = [], isLoading, isError } = useContracts({ 
    search, 
    status: activeOnly ? 'Active' : status, 
    employeeId 
  });

  const activeCount = contracts.filter(c => (c.status || '').toLowerCase() === 'active').length;
  const totalWageSum = contracts
    .filter(c => (c.status || '').toLowerCase() === 'active')
    .reduce((sum, c) => sum + (Number(c.wage) || 0), 0);

  const columns = [
    { 
      header: 'Contract Reference', 
      accessor: 'reference',
      render: (row) => (
        <div className="font-mono text-xs font-semibold text-text-main flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-accent-blue" />
          <span>{row.reference || `CTR-${row.id}`}</span>
        </div>
      )
    },
    { 
      header: 'Employee', 
      accessor: 'employeeName',
      render: (row) => (
        <div>
          <div className="font-medium text-text-main text-xs">{row.employeeName || 'Assigned Staff'}</div>
          {row.department && <div className="text-[11px] text-text-muted">{row.department}</div>}
        </div>
      )
    },
    { 
      header: 'Duration', 
      accessor: 'startDate',
      render: (row) => (
        <div className="text-xs font-mono text-text-secondary">
          <span>{row.startDate}</span>
          <span className="text-text-muted mx-1">→</span>
          <span className={row.endDate ? 'text-text-secondary' : 'text-accent-cyan font-sans font-medium text-[11px]'}>
            {row.endDate || 'Ongoing'}
          </span>
        </div>
      )
    },
    { 
      header: 'Monthly Wage', 
      accessor: 'wage',
      render: (row) => (
        <MoneyDisplay amount={row.wage} className="text-xs font-semibold" />
      )
    },
    { 
      header: 'Salary Structure', 
      accessor: 'salaryStructure',
      render: (row) => (
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-3 text-text-secondary border border-border-subtle">
          {row.salaryStructure || 'Regular Pay Structure'}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status', 
      render: (row) => <StatusPill status={row.status || 'Active'} /> 
    }
  ];

  const handleRowClick = (contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedContract(null);
    setIsModalOpen(true);
  };

  const clearEmployeeFilter = () => {
    searchParams.delete('employee_id');
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <PageHeader 
        title="Employment Contracts" 
        subtitle="Manage formal compensation agreements, salary structures, and contractual timelines"
        breadcrumbs={[
          { label: 'Employees', to: '/employees' },
          { label: 'Contracts' }
        ]}
        actions={
          <Button 
            onClick={handleNew} 
            variant="primary" 
            size="sm"
            className="gap-2 shadow-sm"
          >
            <Plus size={16} />
            <span>New Contract</span>
          </Button>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Active Agreements</div>
            <div className="text-xl font-bold font-mono text-text-main">{activeCount}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-emerald/15 text-accent-emerald flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Monthly Committed Payroll</div>
            <div className="text-xl font-bold text-text-main">
              <MoneyDisplay amount={totalWageSum} />
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Total Catalog</div>
            <div className="text-xl font-bold font-mono text-text-main">{contracts.length}</div>
          </div>
        </Card>
      </div>

      {employeeId && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-xs text-accent-blue">
          <span className="font-medium">
            Filtering contracts specifically for Employee #{employeeId}
          </span>
          <button 
            onClick={clearEmployeeFilter}
            className="underline hover:text-text-main transition-colors font-medium ml-3"
          >
            Show All Contracts
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-2 p-3.5 rounded-xl border border-border-subtle shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <Input 
              className="pl-9 bg-surface-3 border-border-subtle text-xs h-9"
              placeholder="Search reference or employee..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select 
            className="w-full sm:w-44 bg-surface-3 border-border-subtle text-xs h-9"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={activeOnly}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Expired">Expired</option>
          </Select>

          <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none bg-surface-3 px-3 py-2 rounded-lg border border-border-subtle hover:text-text-main">
            <input 
              type="checkbox" 
              checked={activeOnly} 
              onChange={(e) => setActiveOnly(e.target.checked)} 
              className="rounded bg-surface-1 border-border-subtle text-accent-blue focus:ring-0 cursor-pointer"
            />
            <span>Active Only</span>
          </label>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-surface-2 border border-border-subtle rounded-xl overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-12 text-center text-text-muted flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
            <span className="text-xs">Loading contracts catalog...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-accent-rose">Failed to load contracts.</div>
        ) : contracts?.length === 0 ? (
          <EmptyState 
            icon={FileText}
            title="No contracts found"
            description={search ? `No contracts match "${search}".` : "No contracts registered under the current filter."}
            actionLabel="Create New Contract"
            onAction={handleNew}
          />
        ) : (
          <Table 
            columns={columns} 
            data={contracts} 
            onRowClick={handleRowClick}
          />
        )}
      </div>

      <ContractFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contract={selectedContract}
        prefilledEmployeeId={employeeId}
      />
    </div>
  );
}
