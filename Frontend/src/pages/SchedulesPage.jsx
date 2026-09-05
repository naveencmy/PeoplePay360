import React, { useState } from 'react';
import { Plus, Calendar, Clock, CheckCircle2, Building, ShieldCheck } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import StatusPill from '@/components/ui/StatusPill';
import { Card } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { useSchedules } from '@/hooks/useSchedules';
import ScheduleFormModal from '@/components/schedule/ScheduleFormModal';

export default function SchedulesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: schedules = [], isLoading, isError } = useSchedules();

  const columns = [
    { 
      header: 'Schedule Policy', 
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-3 border border-border-subtle flex items-center justify-center text-accent-blue shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-text-main text-xs">{row.name}</div>
            <div className="text-[11px] text-text-muted">Standard recurring template</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Work Days', 
      accessor: 'daysPerWeek',
      render: (row) => (
        <span className="text-xs font-mono font-medium text-text-secondary">
          {row.daysPerWeek || 5} days / week
        </span>
      )
    },
    { 
      header: 'Weekly Target Hours', 
      accessor: 'hoursPerWeek',
      render: (row) => (
        <span className="text-xs font-mono font-semibold text-accent-blue px-2 py-0.5 rounded bg-accent-blue/10 border border-accent-blue/20">
          {row.hoursPerWeek || 40} hrs
        </span>
      )
    },
    { 
      header: 'Applicable Entity', 
      accessor: 'company', 
      render: () => (
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <Building className="w-3.5 h-3.5 text-text-muted" />
          <span>PeoplePay360 Global</span>
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status', 
      render: (row) => <StatusPill status={row.status || 'Active'} /> 
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <PageHeader 
        title="Working Schedules" 
        subtitle="Configure standard work shifts, weekly target hours, and attendance baseline schedules"
        breadcrumbs={[
          { label: 'Employees', to: '/employees' },
          { label: 'Working Schedules' }
        ]}
        actions={
          <Button 
            onClick={() => setIsModalOpen(true)} 
            variant="primary" 
            size="sm"
            className="gap-2 shadow-sm"
          >
            <Plus size={16} />
            <span>New Schedule</span>
          </Button>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Active Patterns</div>
            <div className="text-xl font-bold font-mono text-text-main">{schedules.length}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-emerald/15 text-accent-emerald flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Standard Norm</div>
            <div className="text-xl font-bold font-mono text-text-main">40.0 hrs/wk</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/15 text-accent-purple flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Overtime Threshold</div>
            <div className="text-xl font-bold font-mono text-text-main">48.0 hrs/wk</div>
          </div>
        </Card>
      </div>

      <div className="bg-surface-2 border border-border-subtle rounded-xl overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-12 text-center text-text-muted flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
            <span className="text-xs">Loading working schedules...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-accent-rose">Failed to load schedules.</div>
        ) : schedules?.length === 0 ? (
          <EmptyState 
            icon={Calendar}
            title="No working schedules"
            description="Create your first shift schedule to configure attendance tracking and overtime."
            actionLabel="Create Schedule"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <Table columns={columns} data={schedules} />
        )}
      </div>

      <ScheduleFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
