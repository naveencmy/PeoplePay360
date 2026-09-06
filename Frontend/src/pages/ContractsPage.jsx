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
import useAuthStore from '@/store/authStore';

export default function ContractsPage() {
  const user = useAuthStore(s => s.user);
  const role = (user?.role || '').toUpperCase();
  const canManage = role === 'ADMIN' || role === 'HR';

  const [searchParams, setSearchParams] = useSearchParams();
  const employeeId = searchParams.get('employee_id');
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const { data: rawContracts = [], isLoading, isError } = useContracts({ 
    search: search.trim() || undefined, 
    status: activeOnly ? 'ACTIVE' : (status ? status.toUpperCase() : undefined), 
    employeeId: employeeId || undefined
  });

  const contracts = React.useMemo(() => {
    return Array.isArray(rawContracts) ? rawContracts : (rawContracts?.data || []);
  }, [rawContracts]);

  const filteredContracts = React.useMemo(() => {
    return contracts.filter(c => {
      const q = (search || '').trim().toLowerCase();
      if (q) {
        const ref = (c.reference || c.name || '').toLowerCase();
        const emp = (c.employeeName || `${c.first_name || ''} ${c.last_name || ''}`).toLowerCase();
        const dept = (c.department || '').toLowerCase();
        const job = (c.jobTitle || c.job_title || '').toLowerCase();
        const struct = (c.salaryStructure || c.structure_name || '').toLowerCase();
        const code = (c.employee_code || '').toLowerCase();
        const match = ref.includes(q) || emp.includes(q) || dept.includes(q) || job.includes(q) || struct.includes(q) || code.includes(q);
        if (!match) return false;
      }

      const targetStatus = activeOnly ? 'active' : (status ? status.toLowerCase() : '');
      if (targetStatus && targetStatus !== 'all') {
        const cStatus = (c.status || c.state || '').toLowerCase();
        if (cStatus !== targetStatus) return false;
      }

      return true;
    });
  }, [contracts, search, status, activeOnly]);

  const activeCount = filteredContracts.filter(c => (c.status || c.state || '').toLowerCase() === 'active').length;
  const totalWageSum = filteredContracts
    .filter(c => (c.status || c.state || '').toLowerCase() === 'active')
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
        subtitle="Master terms, gross compensation scales, and assigned salary calculation structures"
        breadcrumbs={[
          { label: 'Employees', to: '/employees' },
          { label: 'Contracts' }
        ]}
        actions={
          canManage && (
            <Button 
              onClick={handleNew} 
              variant="primary" 
              size="sm"
              className="gap-2 shadow-sm"
            >
              <Plus size={16} />
              <span>New Contract</span>
            </Button>
          )
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
            <div className="text-xl font-bold font-mono text-text-main">{filteredContracts.length}</div>
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
              placeholder="Search reference, employee, title..." 
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
        ) : filteredContracts.length === 0 ? (
          <EmptyState 
            icon={FileText}
            title="No contracts found"
            description={search ? `No contracts match "${search}".` : "No contracts registered under the current filter."}
            actionLabel={canManage ? "Create New Contract" : undefined}
            onAction={canManage ? handleNew : undefined}
          />
        ) : (
          <Table 
            columns={columns} 
            data={filteredContracts} 
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
