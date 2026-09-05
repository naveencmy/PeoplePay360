import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import StatusPill from '@/components/ui/StatusPill';
import { useContracts } from '@/hooks/useContracts';
import ContractFormModal from '@/components/contract/ContractFormModal';

export default function ContractsPage() {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employee_id');
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const { data: contracts, isLoading, isError } = useContracts({ 
    search, 
    status: activeOnly ? 'Active' : status, 
    employeeId 
  });

  const columns = [
    { header: 'Contract Ref', accessor: 'reference' },
    { header: 'Employee', accessor: 'employeeName' },
    { header: 'Start Date', accessor: 'startDate' },
    { header: 'End Date', accessor: 'endDate', render: (row) => row.endDate || 'Ongoing' },
    { 
      header: 'Wage', 
      accessor: 'wage',
      render: (row) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(row.wage)
    },
    { header: 'Salary Structure', accessor: 'salaryStructure' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusPill status={row.status} /> }
  ];

  const handleRowClick = (contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedContract(null);
    setIsModalOpen(true);
  };

  const rowClassName = (row) => row.status === 'Active' ? 'border-l-2 border-green-500 bg-green-500/5' : '';

  return (
    <div className="p-6 h-full flex flex-col bg-[#0B0D10] text-gray-100">
      <PageHeader 
        title="Contracts" 
        subtitle="Manage employee contracts and salary structures"
      />

      {employeeId && (
        <div className="bg-[#4F7CFF]/10 text-[#4F7CFF] px-4 py-2 rounded-md mb-4 border border-[#4F7CFF]/20">
          Showing contracts for selected employee
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input 
              className="pl-10 bg-[#161B22] border-[rgba(255,255,255,0.08)]"
              placeholder="Search contracts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select 
            className="w-40 bg-[#161B22] border-[rgba(255,255,255,0.08)]"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={activeOnly}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Expired">Expired</option>
          </Select>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input 
              type="checkbox" 
              checked={activeOnly} 
              onChange={(e) => setActiveOnly(e.target.checked)} 
              className="rounded bg-[#161B22] border-[rgba(255,255,255,0.08)]"
            />
            Active Only
          </label>
        </div>
        
        <Button onClick={handleNew} className="bg-[#4F7CFF] hover:bg-blue-600">
          <Plus size={18} className="mr-2" /> New Contract
        </Button>
      </div>

      <div className="flex-1 overflow-hidden bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full text-red-400">Failed to load contracts.</div>
        ) : contracts?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">No contracts found.</div>
        ) : (
          <Table 
            columns={columns} 
            data={contracts} 
            onRowClick={handleRowClick}
            rowClassName={rowClassName}
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
