import React from 'react';
import { Modal, Button, Table, StatusPill } from '@/components/ui';

export default function AllocationDetailModal({ allocation, onClose }) {
  if (!allocation) return null;

  const remaining = allocation.allocated - allocation.taken;
  const percentTaken = (allocation.taken / allocation.allocated) * 100;
  const isLow = (remaining / allocation.allocated) < 0.2;

  return (
    <Modal isOpen={true} onClose={onClose} title="Allocation Detail">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-4 rounded-xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Employee</div>
            <div className="text-slate-900 dark:text-white font-semibold text-base mt-1">{allocation.employeeName}</div>
          </div>
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-4 rounded-xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Leave Type</div>
            <div className="text-slate-900 dark:text-white font-semibold text-base mt-1">{allocation.type}</div>
          </div>
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-4 rounded-xl col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Period</div>
            <div className="text-slate-900 dark:text-white font-medium text-sm mt-1">{allocation.period}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">Usage Progress</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Taken {allocation.taken} / {allocation.allocated} days</div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#0B0D10] rounded-full h-3.5 border border-slate-200 dark:border-white/10 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${isLow ? 'bg-rose-500' : 'bg-blue-600'}`} 
              style={{ width: `${Math.min(100, Math.max(0, percentTaken))}%` }}
            />
          </div>
          <div className={`text-xs font-semibold mt-1 ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {remaining} days remaining
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">Recent Requests (using this allocation)</h4>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-[#161B22]">
            {allocation.requests && allocation.requests.length > 0 ? (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Date Range</Table.Head>
                    <Table.Head>Days</Table.Head>
                    <Table.Head>Status</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {allocation.requests.map((req, idx) => (
                    <Table.Row key={idx}>
                      <Table.Cell className="text-slate-600 dark:text-gray-300">{req.dateRange || `${req.startDate} - ${req.endDate}`}</Table.Cell>
                      <Table.Cell className="text-slate-900 dark:text-white font-medium">{req.days || req.duration}</Table.Cell>
                      <Table.Cell><StatusPill status={req.status}>{req.status}</StatusPill></Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <div className="p-5 text-center text-xs text-slate-500 dark:text-slate-400">
                No leave requests logged against this allocation.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
