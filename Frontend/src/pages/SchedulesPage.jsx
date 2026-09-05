import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import StatusPill from '@/components/ui/StatusPill';
import { useSchedules } from '@/hooks/useSchedules';
import ScheduleFormModal from '@/components/schedule/ScheduleFormModal';

export default function SchedulesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: schedules, isLoading, isError } = useSchedules();

  const columns = [
    { header: 'Schedule Name', accessor: 'name' },
    { header: 'Days/Week', accessor: 'daysPerWeek' },
    { header: 'Hours/Week', accessor: 'hoursPerWeek' },
    { header: 'Company', accessor: 'company', render: () => 'PeoplePay360' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusPill status={row.status || 'Active'} /> }
  ];

  return (
    <div className="p-6 h-full flex flex-col bg-[#0B0D10] text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <PageHeader 
          title="Working Schedules" 
          subtitle="Manage work shifts and timings"
          className="mb-0"
        />
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#4F7CFF] hover:bg-blue-600">
          <Plus size={18} className="mr-2" /> New Schedule
        </Button>
      </div>

      <div className="flex-1 overflow-hidden bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full text-red-400">Failed to load schedules.</div>
        ) : schedules?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">No schedules found.</div>
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
