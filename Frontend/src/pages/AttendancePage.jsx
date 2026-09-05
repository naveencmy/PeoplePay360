import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAttendance } from '@/hooks/useAttendance';
import PageHeader from '@/components/layout/PageHeader';
import CheckInWidget from '@/components/attendance/CheckInWidget';
import AttendanceDetailModal from '@/components/attendance/AttendanceDetailModal';
import { Card, Table, Button, Input, Select, StatusPill, AvatarBadge } from '@/components/ui';
import { format } from 'date-fns';

export default function AttendancePage() {
  const [searchParams] = useSearchParams();
  const initialEmployeeId = searchParams.get('employee_id') || '';

  const [filters, setFilters] = useState({
    employeeSearch: initialEmployeeId,
    dateFrom: '',
    dateTo: '',
    status: 'All'
  });

  const [selectedRecord, setSelectedRecord] = useState(null);

  const { data: attendanceData, isLoading, error } = useAttendance(filters);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Late': return 'warning';
      case 'Absent': return 'danger';
      case 'Overtime': return 'primary';
      case 'Missing Checkout': return 'warning';
      case 'Manually Corrected': return 'info';
      default: return 'default';
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    if (typeof timeStr === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(timeStr.trim())) {
      const [h, m] = timeStr.trim().split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h12 = hour % 12 || 12;
      return `${h12}:${m} ${ampm}`;
    }
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return String(timeStr);
      return format(d, 'hh:mm a');
    } catch {
      return String(timeStr);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return format(d, 'MMM dd, yyyy');
    } catch {
      return String(dateStr);
    }
  };

  const records = Array.isArray(attendanceData) ? attendanceData : (Array.isArray(attendanceData?.data) ? attendanceData.data : []);

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="Attendance" 
        subtitle="Track employee check-ins, check-outs, and worked hours" 
      />

      <CheckInWidget />

      <Card className="p-4 bg-[#161B22] border-[rgba(255,255,255,0.08)]">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input 
            placeholder="Search Employee..." 
            name="employeeSearch" 
            value={filters.employeeSearch} 
            onChange={handleFilterChange} 
            className="flex-1"
          />
          <Input 
            type="date" 
            name="dateFrom" 
            value={filters.dateFrom} 
            onChange={handleFilterChange} 
          />
          <Input 
            type="date" 
            name="dateTo" 
            value={filters.dateTo} 
            onChange={handleFilterChange} 
          />
          <Select 
            name="status" 
            value={filters.status} 
            onChange={handleFilterChange}
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="Overtime">Overtime</option>
            <option value="Missing Checkout">Missing Checkout</option>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading attendance data...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error loading attendance</div>
        ) : !records?.length ? (
          <div className="text-center py-8 text-gray-400">No attendance records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Employee</Table.Head>
                  <Table.Head>Date</Table.Head>
                  <Table.Head>Check In</Table.Head>
                  <Table.Head>Check Out</Table.Head>
                  <Table.Head>Worked Hours</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {records.map((record) => (
                  <Table.Row key={record.id} onClick={() => setSelectedRecord(record)} className="cursor-pointer hover:bg-white/5 transition-colors">
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <AvatarBadge src={record.employeeAvatar} alt={record.employeeName} />
                        <span className="font-medium text-white">{record.employeeName}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="text-gray-300">{formatDate(record.date)}</Table.Cell>
                    <Table.Cell className="text-gray-300">{formatTime(record.checkIn)}</Table.Cell>
                    <Table.Cell className="text-gray-300">{formatTime(record.checkOut)}</Table.Cell>
                    <Table.Cell className="text-gray-300">{record.workedHours ? `${record.workedHours}h` : '-'}</Table.Cell>
                    <Table.Cell>
                      <StatusPill variant={getStatusColor(record.status)}>{record.status}</StatusPill>
                    </Table.Cell>
                    <Table.Cell>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedRecord(record); }}>
                        Correct
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </Card>

      {selectedRecord && (
        <AttendanceDetailModal 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
        />
      )}
    </div>
  );
}
