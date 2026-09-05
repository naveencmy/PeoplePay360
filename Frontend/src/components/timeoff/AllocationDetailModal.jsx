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
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Employee</div>
            <div className="text-white font-medium text-lg">{allocation.employeeName}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Leave Type</div>
            <div className="text-white font-medium text-lg">{allocation.type}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-lg col-span-2">
            <div className="text-sm text-gray-400">Period</div>
            <div className="text-white font-medium">{allocation.period}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="text-sm font-medium text-white">Usage Progress</div>
            <div className="text-xs text-gray-400">Taken {allocation.taken} / {allocation.allocated} days</div>
          </div>
          <div className="w-full bg-[#0B0D10] rounded-full h-4 border border-[rgba(255,255,255,0.08)] overflow-hidden">
            <div 
              className={`h-full ${isLow ? 'bg-red-500' : 'bg-[#4F7CFF]'}`} 
              style={{ width: `${percentTaken}%` }}
            />
          </div>
          <div className={`text-sm font-medium mt-1 ${isLow ? 'text-red-400' : 'text-green-400'}`}>
            {remaining} days remaining
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-white font-medium">Recent Requests (using this allocation)</h4>
          <div className="border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden bg-[#161B22]">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Date Range</Table.Head>
                  <Table.Head>Days</Table.Head>
                  <Table.Head>Status</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {/* Mock data for demonstration */}
                <Table.Row>
                  <Table.Cell className="text-gray-300">Oct 12 - Oct 14, 2023</Table.Cell>
                  <Table.Cell className="text-white font-medium">3</Table.Cell>
                  <Table.Cell><StatusPill variant="success">Approved</StatusPill></Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell className="text-gray-300">Dec 20 - Dec 22, 2023</Table.Cell>
                  <Table.Cell className="text-white font-medium">3</Table.Cell>
                  <Table.Cell><StatusPill variant="warning">Pending</StatusPill></Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[rgba(255,255,255,0.08)]">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
