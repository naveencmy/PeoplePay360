import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, List, Plus, Trash2, Edit2 } from 'lucide-react';
import { useEmployees, useDeleteEmployee } from '@/hooks/useEmployees';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import AvatarBadge from '@/components/ui/AvatarBadge';
import StatusPill from '@/components/ui/StatusPill';
import Modal from '@/components/ui/Modal';
import EmployeeKanban from '@/components/employee/EmployeeKanban';
import CreateEmployeeModal from '@/components/employee/CreateEmployeeModal';

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const { data: employees, isLoading, isError } = useEmployees({ search, department });
  const deleteEmployee = useDeleteEmployee();

  const handleDelete = async () => {
    if (employeeToDelete) {
      await deleteEmployee.mutateAsync(employeeToDelete);
      setEmployeeToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'name',
      render: (row) => (
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1 rounded transition"
          onClick={() => navigate(`/employees/${row.id}`)}
        >
          <AvatarBadge name={row.name} imageUrl={row.avatarUrl} />
          <div>
            <div className="font-medium text-gray-100">{row.name}</div>
            <div className="text-xs text-gray-400">{row.employeeId}</div>
          </div>
        </div>
      ),
    },
    { header: 'Work Email', accessor: 'workEmail' },
    { header: 'Job Position', accessor: 'jobPosition' },
    { header: 'Department', accessor: 'department' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusPill status={row.status} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/employees/${row.id}`)}>
            <Edit2 size={16} />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => setEmployeeToDelete(row.id)}>
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  if (isError) return <div className="p-6 text-red-400">Failed to load employees.</div>;

  return (
    <div className="p-6 h-full flex flex-col bg-[#0B0D10] text-gray-100">
      <PageHeader 
        title="Employees" 
        subtitle="List view for sort, filter and bulk scanning"
      />

      <div className="flex items-center justify-between mt-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input 
              className="pl-10 bg-[#161B22] border-[rgba(255,255,255,0.08)]"
              placeholder="Search employees..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select 
            className="w-48 bg-[#161B22] border-[rgba(255,255,255,0.08)]"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-md overflow-hidden">
            <button 
              className={`p-2 transition ${view === 'list' ? 'bg-[#4F7CFF] text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setView('list')}
            >
              <List size={20} />
            </button>
            <button 
              className={`p-2 transition ${view === 'kanban' ? 'bg-[#4F7CFF] text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setView('kanban')}
            >
              <LayoutGrid size={20} />
            </button>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#4F7CFF] hover:bg-blue-600">
            <Plus size={18} className="mr-2" /> New Employee
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
        ) : employees?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">No employees found.</div>
        ) : view === 'list' ? (
          <Table columns={columns} data={employees} className="bg-[#161B22]" />
        ) : (
          <EmployeeKanban employees={employees} />
        )}
      </div>

      <CreateEmployeeModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      {employeeToDelete && (
        <Modal isOpen={true} onClose={() => setEmployeeToDelete(null)} title="Confirm Delete">
          <div className="p-4">
            <p className="mb-4 text-gray-300">Are you sure you want to delete this employee? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setEmployeeToDelete(null)}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600" onClick={handleDelete} isLoading={deleteEmployee.isLoading}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
