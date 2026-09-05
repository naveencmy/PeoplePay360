import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Card, Button, Input, Select, StatusPill, AvatarBadge } from '@/components/ui';
import EmptyState from '@/components/ui/EmptyState';
import { useLeaveRequests, useLeaveAllocations, useTimeOffTypes } from '@/hooks/useTimeOff';
import LeaveRequestModal from '@/components/timeoff/LeaveRequestModal';
import AllocationDetailModal from '@/components/timeoff/AllocationDetailModal';
import TimeOffTypeFormModal from '@/components/timeoff/TimeOffTypeFormModal';
import { 
  CalendarDays, CheckCircle2, Clock, XCircle, Plus, Search, 
  Filter, Layers, ShieldCheck, AlertCircle, Sparkles 
} from 'lucide-react';

export default function TimeOffPage({ initialTab = 'requests' }) {
  const normalizeTab = (t) => {
    if (!t) return 'Requests';
    const lower = t.toLowerCase();
    if (lower === 'allocations') return 'Allocations';
    if (lower === 'types') return 'Types';
    return 'Requests';
  };

  const [activeTab, setActiveTab] = useState(normalizeTab(initialTab));

  useEffect(() => {
    if (initialTab) {
      setActiveTab(normalizeTab(initialTab));
    }
  }, [initialTab]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <PageHeader 
        title="Time Off & Leaves" 
        subtitle="Manage employee leave requests, annual quota allocations, and statutory paid leave policies" 
        breadcrumbs={[
          { label: 'Time Off', to: '/time-off' },
          { label: activeTab }
        ]}
      />

      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center gap-1 bg-surface-2 p-1.5 rounded-xl border border-border-subtle w-fit">
        {[
          { id: 'Requests', label: 'Leave Requests', icon: CalendarDays },
          { id: 'Allocations', label: 'Leave Balances', icon: Layers },
          { id: 'Types', label: 'Leave Policies', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-surface-1 text-accent-blue shadow-sm border border-border-subtle/50'
                  : 'text-text-muted hover:text-text-main hover:bg-surface-3/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {activeTab === 'Requests' && <RequestsTab />}
        {activeTab === 'Allocations' && <AllocationsTab />}
        {activeTab === 'Types' && <TypesTab />}
      </div>
    </div>
  );
}

function RequestsTab() {
  const [filters, setFilters] = useState({ employee: '', status: 'All', type: 'All' });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const { data: requests = [], isLoading } = useLeaveRequests(filters);

  const pendingCount = requests.filter(r => (r.status || '').toLowerCase() === 'pending').length;
  const approvedCount = requests.filter(r => (r.status || '').toLowerCase() === 'approved').length;
  const refusedCount = requests.filter(r => (r.status || '').toLowerCase() === 'refused').length;

  return (
    <div className="space-y-6">
      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Awaiting Decision</div>
            <div className="text-xl font-bold font-mono text-text-main">{pendingCount}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-emerald/15 text-accent-emerald flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Approved Leaves</div>
            <div className="text-xl font-bold font-mono text-text-main">{approvedCount}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-surface-3 text-text-muted flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Refused / Withdrawn</div>
            <div className="text-xl font-bold font-mono text-text-main">{refusedCount}</div>
          </div>
        </Card>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-2 p-3.5 rounded-xl border border-border-subtle shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <Input 
              placeholder="Search employee..." 
              value={filters.employee} 
              onChange={(e) => setFilters({...filters, employee: e.target.value})} 
              className="pl-9 bg-surface-3 border-border-subtle text-xs h-9"
            />
          </div>

          <Select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full sm:w-40 bg-surface-3 border-border-subtle text-xs h-9"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Refused">Refused</option>
          </Select>
        </div>

        <Button 
          variant="primary" 
          size="sm"
          onClick={() => setIsNewModalOpen(true)}
          className="gap-1.5 shadow-sm"
        >
          <Plus size={16} />
          <span>Request Leave</span>
        </Button>
      </div>

      {/* Requests Table */}
      <div className="bg-surface-2 border border-border-subtle rounded-xl overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-12 text-center text-text-muted flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
            <span className="text-xs">Loading leave requests...</span>
          </div>
        ) : !requests?.length ? (
          <EmptyState 
            icon={CalendarDays}
            title="No leave requests"
            description="There are no pending or historic leave applications matching your search."
            actionLabel="Apply for Leave"
            onAction={() => setIsNewModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-1 text-text-muted font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Policy</th>
                  <th className="py-3 px-4">From</th>
                  <th className="py-3 px-4">To</th>
                  <th className="py-3 px-4 text-center">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {requests.map((req) => (
                  <tr 
                    key={req.id} 
                    onClick={() => setSelectedRequest(req)} 
                    className="hover:bg-surface-3/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <AvatarBadge name={req.employeeName} imageUrl={req.employeeAvatar} size="sm" />
                        <span className="font-semibold text-text-main group-hover:text-accent-blue transition-colors">
                          {req.employeeName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary font-medium">
                      <span className="px-2 py-0.5 rounded bg-surface-3 border border-border-subtle font-mono text-[11px]">
                        {req.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary">{req.fromDate}</td>
                    <td className="py-3 px-4 font-mono text-text-secondary">{req.toDate}</td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-text-main">
                      {req.duration} days
                    </td>
                    <td className="py-3 px-4">
                      <StatusPill status={req.status || 'Pending'} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-xs text-accent-blue font-medium hover:underline">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(isNewModalOpen || selectedRequest) && (
        <LeaveRequestModal 
          request={selectedRequest} 
          onClose={() => { setIsNewModalOpen(false); setSelectedRequest(null); }} 
        />
      )}
    </div>
  );
}

function AllocationsTab() {
  const [filters, setFilters] = useState({ employee: '', type: 'All' });
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  
  const { data: allocations = [], isLoading } = useLeaveAllocations(filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-2 p-3.5 rounded-xl border border-border-subtle shadow-card">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <Input 
            placeholder="Search employee allocations..." 
            value={filters.employee} 
            onChange={(e) => setFilters({...filters, employee: e.target.value})} 
            className="pl-9 bg-surface-3 border-border-subtle text-xs h-9"
          />
        </div>
      </div>

      <div className="bg-surface-2 border border-border-subtle rounded-xl overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-12 text-center text-text-muted flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
            <span className="text-xs">Loading leave balances...</span>
          </div>
        ) : !allocations?.length ? (
          <EmptyState 
            icon={Layers}
            title="No allocations configured"
            description="Leave balances have not been assigned for this cycle."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-1 text-text-muted font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Policy Type</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-center">Allocated</th>
                  <th className="py-3 px-4 text-center">Taken</th>
                  <th className="py-3 px-4 text-center">Remaining</th>
                  <th className="py-3 px-4 w-48">Usage Meter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {allocations.map((alloc) => {
                  const allocated = Number(alloc.allocated) || 1;
                  const taken = Number(alloc.taken) || 0;
                  const remaining = Math.max(0, allocated - taken);
                  const percentTaken = Math.min(100, Math.round((taken / allocated) * 100));
                  const isLow = (remaining / allocated) < 0.2;
                  
                  return (
                    <tr 
                      key={alloc.id} 
                      onClick={() => setSelectedAllocation(alloc)} 
                      className="hover:bg-surface-3/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-text-main group-hover:text-accent-blue transition-colors">
                        {alloc.employeeName}
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary">
                        <span className="px-2 py-0.5 rounded bg-surface-3 border border-border-subtle font-mono text-[11px]">
                          {alloc.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-text-muted font-mono">{alloc.period}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-text-secondary">{allocated}d</td>
                      <td className="py-3.5 px-4 text-center font-mono text-accent-amber font-medium">{taken}d</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span className={isLow ? 'text-accent-rose' : 'text-accent-emerald'}>
                          {remaining}d
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
                            <span>{percentTaken}% used</span>
                            <span>{remaining} left</span>
                          </div>
                          <div className="w-full bg-surface-3 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isLow ? 'bg-accent-rose' : 'bg-accent-blue'}`} 
                              style={{ width: `${percentTaken}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedAllocation && (
        <AllocationDetailModal allocation={selectedAllocation} onClose={() => setSelectedAllocation(null)} />
      )}
    </div>
  );
}

function TypesTab() {
  const { data: types = [], isLoading } = useTimeOffTypes();
  const [selectedType, setSelectedType] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-surface-2 p-3.5 rounded-xl border border-border-subtle shadow-card">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Corporate Policies</h3>
          <p className="text-xs text-text-secondary">Define accrual rules and payroll deduction linkages</p>
        </div>
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => setIsNewModalOpen(true)}
          className="gap-1.5 shadow-sm"
        >
          <Plus size={16} />
          <span>New Leave Policy</span>
        </Button>
      </div>

      <div className="bg-surface-2 border border-border-subtle rounded-xl overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-12 text-center text-text-muted flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
            <span className="text-xs">Loading leave policies...</span>
          </div>
        ) : !types?.length ? (
          <EmptyState 
            icon={ShieldCheck}
            title="No leave policies"
            description="Create leave policies to govern employee time off requests."
            actionLabel="Create Policy"
            onAction={() => setIsNewModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-1 text-text-muted font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Policy Designation</th>
                  <th className="py-3 px-4">Accrual Unit</th>
                  <th className="py-3 px-4">Allocation Required</th>
                  <th className="py-3 px-4">Approval Required</th>
                  <th className="py-3 px-4">Payroll Deduction Impact</th>
                  <th className="py-3 px-4 text-right">Configure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {types.map((type) => (
                  <tr 
                    key={type.id} 
                    onClick={() => setSelectedType(type)} 
                    className="hover:bg-surface-3/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-semibold text-text-main group-hover:text-accent-blue transition-colors">
                      {type.name}
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary font-mono">{type.unit || 'Days'}</td>
                    <td className="py-3.5 px-4">
                      <StatusPill status={type.allocationRequired ? 'Yes' : 'No'} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusPill status={type.approvalRequired ? 'Yes' : 'No'} />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        type.payrollIntegration 
                          ? 'bg-accent-purple/15 text-accent-purple border-accent-purple/30' 
                          : 'bg-surface-3 text-text-muted border-border-subtle'
                      }`}>
                        {type.payrollIntegration ? 'Integrated (LOP Rules)' : 'Non-Deductive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-xs text-accent-blue font-medium hover:underline">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(isNewModalOpen || selectedType) && (
        <TimeOffTypeFormModal type={selectedType} onClose={() => { setIsNewModalOpen(false); setSelectedType(null); }} />
      )}
    </div>
  );
}
