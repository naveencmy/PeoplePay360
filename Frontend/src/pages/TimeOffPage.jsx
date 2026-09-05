import React, { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Card, Table, Button, Input, Select, StatusPill, AvatarBadge } from '@/components/ui';
import { useLeaveRequests, useLeaveAllocations, useTimeOffTypes } from '@/hooks/useTimeOff';
import LeaveRequestModal from '@/components/timeoff/LeaveRequestModal';
import AllocationDetailModal from '@/components/timeoff/AllocationDetailModal';
import TimeOffTypeFormModal from '@/components/timeoff/TimeOffTypeFormModal';

export default function TimeOffPage() {
  const [activeTab, setActiveTab] = useState('Requests'); // Requests, Allocations, Types
  
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Time Off" subtitle="Manage employee leave requests, balances, and policies" />

      <div className="flex space-x-1 border-b border-[rgba(255,255,255,0.08)] mb-6">
        {['Requests', 'Allocations', 'Types'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-[#4F7CFF] text-[#4F7CFF]'
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
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

  const { data: requests, isLoading } = useLeaveRequests(filters);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Refused': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <Input 
            placeholder="Search Employee..." 
            value={filters.employee} 
            onChange={(e) => setFilters({...filters, employee: e.target.value})} 
          />
          <Select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Refused">Refused</option>
          </Select>
        </div>
        <Button variant="primary" onClick={() => setIsNewModalOpen(true)}>+ Request Time Off</Button>
      </div>

      <Card className="p-0 overflow-hidden bg-[#161B22] border-[rgba(255,255,255,0.08)]">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading requests...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Employee</Table.Head>
                  <Table.Head>Type</Table.Head>
                  <Table.Head>From</Table.Head>
                  <Table.Head>To</Table.Head>
                  <Table.Head>Duration</Table.Head>
                  <Table.Head>Status</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {requests?.map((req) => (
                  <Table.Row key={req.id} onClick={() => setSelectedRequest(req)} className="cursor-pointer hover:bg-white/5">
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <AvatarBadge src={req.employeeAvatar} alt={req.employeeName} size="sm" />
                        <span className="text-white">{req.employeeName}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="text-gray-300">{req.type}</Table.Cell>
                    <Table.Cell className="text-gray-300">{req.fromDate}</Table.Cell>
                    <Table.Cell className="text-gray-300">{req.toDate}</Table.Cell>
                    <Table.Cell className="text-gray-300">{req.duration} days</Table.Cell>
                    <Table.Cell>
                      <StatusPill variant={getStatusColor(req.status)}>{req.status}</StatusPill>
                    </Table.Cell>
                  </Table.Row>
                ))}
                {!requests?.length && (
                  <Table.Row><Table.Cell colSpan={6} className="text-center py-6 text-gray-500">No requests found</Table.Cell></Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        )}
      </Card>

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
  
  const { data: allocations, isLoading } = useLeaveAllocations(filters);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <Input 
          placeholder="Search Employee..." 
          value={filters.employee} 
          onChange={(e) => setFilters({...filters, employee: e.target.value})} 
        />
      </div>

      <Card className="p-0 overflow-hidden bg-[#161B22] border-[rgba(255,255,255,0.08)]">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading allocations...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Employee</Table.Head>
                  <Table.Head>Type</Table.Head>
                  <Table.Head>Period</Table.Head>
                  <Table.Head>Allocated</Table.Head>
                  <Table.Head>Taken</Table.Head>
                  <Table.Head>Remaining</Table.Head>
                  <Table.Head>Usage</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {allocations?.map((alloc) => {
                  const remaining = alloc.allocated - alloc.taken;
                  const percentTaken = (alloc.taken / alloc.allocated) * 100;
                  const isLow = (remaining / alloc.allocated) < 0.2;
                  
                  return (
                    <Table.Row key={alloc.id} onClick={() => setSelectedAllocation(alloc)} className="cursor-pointer hover:bg-white/5">
                      <Table.Cell className="text-white font-medium">{alloc.employeeName}</Table.Cell>
                      <Table.Cell className="text-gray-300">{alloc.type}</Table.Cell>
                      <Table.Cell className="text-gray-300">{alloc.period}</Table.Cell>
                      <Table.Cell className="text-gray-300">{alloc.allocated}</Table.Cell>
                      <Table.Cell className="text-gray-300">{alloc.taken}</Table.Cell>
                      <Table.Cell className={isLow ? 'text-red-400 font-medium' : 'text-green-400'}>{remaining}</Table.Cell>
                      <Table.Cell>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full ${isLow ? 'bg-red-500' : 'bg-[#4F7CFF]'}`} style={{ width: `${percentTaken}%` }}></div>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
        )}
      </Card>

      {selectedAllocation && (
        <AllocationDetailModal allocation={selectedAllocation} onClose={() => setSelectedAllocation(null)} />
      )}
    </div>
  );
}

function TypesTab() {
  const { data: types, isLoading } = useTimeOffTypes();
  const [selectedType, setSelectedType] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setIsNewModalOpen(true)}>+ New Type</Button>
      </div>

      <Card className="p-0 overflow-hidden bg-[#161B22] border-[rgba(255,255,255,0.08)]">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading types...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Type Name</Table.Head>
                  <Table.Head>Unit</Table.Head>
                  <Table.Head>Allocation Required</Table.Head>
                  <Table.Head>Approval Required</Table.Head>
                  <Table.Head>Payroll Integration</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {types?.map((type) => (
                  <Table.Row key={type.id} onClick={() => setSelectedType(type)} className="cursor-pointer hover:bg-white/5">
                    <Table.Cell className="text-white font-medium">{type.name}</Table.Cell>
                    <Table.Cell className="text-gray-300">{type.unit}</Table.Cell>
                    <Table.Cell><StatusPill variant={type.allocationRequired ? 'success' : 'default'}>{type.allocationRequired ? 'Yes' : 'No'}</StatusPill></Table.Cell>
                    <Table.Cell><StatusPill variant={type.approvalRequired ? 'success' : 'default'}>{type.approvalRequired ? 'Yes' : 'No'}</StatusPill></Table.Cell>
                    <Table.Cell><StatusPill variant={type.payrollIntegration ? 'primary' : 'default'}>{type.payrollIntegration ? 'Yes' : 'No'}</StatusPill></Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </Card>

      {(isNewModalOpen || selectedType) && (
        <TimeOffTypeFormModal type={selectedType} onClose={() => { setIsNewModalOpen(false); setSelectedType(null); }} />
      )}
    </div>
  );
}
