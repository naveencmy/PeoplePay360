import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, LayoutGrid, List, Plus, Trash2, Edit2, Users, UserCheck, 
  Building, Briefcase, ChevronRight, MoreHorizontal, Mail, Phone, Filter
} from 'lucide-react';
import { useEmployees, useDeleteEmployee } from '@/hooks/useEmployees';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import AvatarBadge from '@/components/ui/AvatarBadge';
import StatusPill from '@/components/ui/StatusPill';
import Modal from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import EmployeeKanban from '@/components/employee/EmployeeKanban';
import CreateEmployeeModal from '@/components/employee/CreateEmployeeModal';

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [view, setView] = useState('list'); // 'list' | 'kanban'
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const { data: employees = [], isLoading, isError } = useEmployees({ search, department });
  const deleteEmployee = useDeleteEmployee();

  const handleDelete = async () => {
    if (employeeToDelete) {
      await deleteEmployee.mutateAsync(employeeToDelete);
      setEmployeeToDelete(null);
    }
  };

  // Filter by status on client if chosen
  const filteredEmployees = employees.filter(e => {
    if (!statusFilter) return true;
    return (e.status || 'Active').toLowerCase() === statusFilter.toLowerCase();
  });

  // Calculate metrics
  const totalCount = employees.length;
  const activeCount = employees.filter(e => (e.status || 'Active').toLowerCase() === 'active').length;
  const deptList = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const columns = [
    {
      header: 'Employee',
      accessor: 'name',
      render: (row) => (
        <div 
          className="flex items-center gap-3 cursor-pointer group py-1"
          onClick={() => navigate(`/employees/${row.id}`)}
        >
          <AvatarBadge name={row.name} imageUrl={row.avatarUrl} size="md" />
          <div>
            <div className="font-semibold text-text-main group-hover:text-accent-blue transition-colors flex items-center gap-1.5">
              <span>{row.name}</span>
            </div>
            <div className="text-xs font-mono text-text-muted">{row.employeeId || `EMP-${row.id}`}</div>
          </div>
        </div>
      ),
    },
    { 
      header: 'Department & Role', 
      accessor: 'jobPosition',
      render: (row) => (
        <div>
          <div className="font-medium text-text-main text-xs">{row.jobPosition || 'Employee'}</div>
          <div className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
            <Building className="w-3 h-3" />
            <span>{row.department || 'General'}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Work Contact', 
      accessor: 'workEmail',
      render: (row) => (
        <div className="text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-text-muted" />
            <span>{row.workEmail || '—'}</span>
          </div>
          {row.phone && (
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted mt-0.5">
              <Phone className="w-3 h-3 text-text-muted" />
              <span>{row.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'employeeType',
      render: (row) => (
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-3 text-text-secondary border border-border-subtle">
          {row.employeeType || 'Full-time'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusPill status={row.status || 'Active'} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/employees/${row.id}`)}
            className="h-8 w-8 p-0 text-text-muted hover:text-accent-blue"
            title="View Profile"
          >
            <Edit2 size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-text-muted hover:text-accent-rose" 
            onClick={() => setEmployeeToDelete(row.id)}
            title="Delete Record"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  if (isError) return (
    <div className="p-8 text-center text-accent-rose bg-surface-2 rounded-xl border border-accent-rose/20 m-6">
      Failed to load employees. Please check network connectivity or backend server.
    </div>
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <PageHeader 
        title="Employee Directory" 
        subtitle="Manage personnel profiles, employment terms, department assignments, and access"
        breadcrumbs={[
          { label: 'Employees', to: '/employees' },
          { label: 'All Personnel' }
        ]}
        actions={
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            variant="primary" 
            size="sm"
            className="gap-2 shadow-sm"
          >
            <Plus size={16} />
            <span>New Employee</span>
          </Button>
        }
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Total Roster</div>
            <div className="text-xl font-bold font-mono text-text-main">{totalCount}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-emerald/15 text-accent-emerald flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Active Staff</div>
            <div className="text-xl font-bold font-mono text-text-main">{activeCount}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/15 text-accent-purple flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Departments</div>
            <div className="text-xl font-bold font-mono text-text-main">{deptList.length || 4}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Contractors</div>
            <div className="text-xl font-bold font-mono text-text-main">
              {employees.filter(e => e.employeeType === 'Contract' || e.employeeType === 'Contractor').length}
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and View Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-2 p-3.5 rounded-xl border border-border-subtle shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <Input 
              className="pl-9 bg-surface-3 border-border-subtle text-xs h-9"
              placeholder="Search by name, ID, or title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select 
            className="w-full sm:w-44 bg-surface-3 border-border-subtle text-xs h-9"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
          </Select>

          <Select 
            className="w-full sm:w-36 bg-surface-3 border-border-subtle text-xs h-9"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex bg-surface-3 border border-border-subtle rounded-lg p-0.5">
            <button 
              className={`p-1.5 rounded-md transition-colors ${
                view === 'list' 
                  ? 'bg-surface-1 text-accent-blue shadow-sm font-semibold' 
                  : 'text-text-muted hover:text-text-main'
              }`}
              onClick={() => setView('list')}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button 
              className={`p-1.5 rounded-md transition-colors ${
                view === 'kanban' 
                  ? 'bg-surface-1 text-accent-blue shadow-sm font-semibold' 
                  : 'text-text-muted hover:text-text-main'
              }`}
              onClick={() => setView('kanban')}
              title="Department Board"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="p-12 text-center text-text-muted flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
            <span className="text-xs">Loading employee directory...</span>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <EmptyState 
            icon={Users}
            title="No employees found"
            description={search ? `No personnel match "${search}". Try adjusting your filters.` : "No employees in this department yet."}
            actionLabel={search ? "Clear Filters" : "Add Employee"}
            onAction={() => {
              if (search) {
                setSearch('');
                setDepartment('');
                setStatusFilter('');
              } else {
                setIsCreateModalOpen(true);
              }
            }}
          />
        ) : view === 'list' ? (
          <div className="bg-surface-2 rounded-xl border border-border-subtle overflow-hidden shadow-card">
            <Table columns={columns} data={filteredEmployees} />
          </div>
        ) : (
          <EmployeeKanban employees={filteredEmployees} />
        )}
      </div>

      <CreateEmployeeModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      {employeeToDelete && (
        <Modal 
          isOpen={true} 
          onClose={() => setEmployeeToDelete(null)} 
          title="Confirm Deletion"
        >
          <div className="p-6 space-y-4">
            <div className="p-3 bg-accent-rose/10 border border-accent-rose/20 rounded-xl text-accent-rose text-xs">
              <strong>Warning:</strong> Deleting an employee record will permanently remove their employment history, linked attendance records, and contracts.
            </div>
            <p className="text-sm text-text-secondary">
              Are you sure you want to proceed with deleting this employee record?
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setEmployeeToDelete(null)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                size="sm"
                onClick={handleDelete} 
                isLoading={deleteEmployee.isLoading}
              >
                Delete Record
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
