import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAttendance } from '@/hooks/useAttendance';
import PageHeader from '@/components/layout/PageHeader';
import CheckInWidget from '@/components/attendance/CheckInWidget';
import AttendanceDetailModal from '@/components/attendance/AttendanceDetailModal';
import { Card, Table, Button, Input, Select, StatusPill, AvatarBadge } from '@/components/ui';
import EmptyState from '@/components/ui/EmptyState';
import { format } from 'date-fns';
import { 
  Users, CheckCircle2, Clock, AlertTriangle, Search, Filter, 
  Download, Edit2, Calendar, FileSpreadsheet 
} from 'lucide-react';

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

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
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
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return format(d, 'MMM dd, yyyy');
    } catch {
      return String(dateStr);
    }
  };

  const records = Array.isArray(attendanceData) ? attendanceData : (Array.isArray(attendanceData?.data) ? attendanceData.data : []);

  // Compute stats
  const presentCount = records.filter(r => (r.status || '').toLowerCase() === 'present').length;
  const lateCount = records.filter(r => (r.status || '').toLowerCase() === 'late').length;
  const missingCount = records.filter(r => (r.status || '').toLowerCase().includes('missing')).length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <PageHeader 
        title="Time & Attendance" 
        subtitle="Live workforce attendance telemetry, shift compliance, and manual timecard reconciliation"
        breadcrumbs={[
          { label: 'Attendance', to: '/attendance' },
          { label: 'Timesheets' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1.5"
              onClick={() => {
                const csvHeader = "data:text/csv;charset=utf-8,Employee,Date,CheckIn,CheckOut,WorkedHours,Status\n";
                const csvRows = records.map(r => `"${r.employeeName}","${r.date}","${r.checkIn || ''}","${r.checkOut || ''}","${r.workedHours || 0}","${r.status || ''}"`).join("\n");
                const encodedUri = encodeURI(csvHeader + csvRows);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `attendance_export_${new Date().toISOString().slice(0, 10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        }
      />

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Logged Shifts</div>
            <div className="text-xl font-bold font-mono text-text-main">{records.length}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-emerald/15 text-accent-emerald flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">On-Time / Present</div>
            <div className="text-xl font-bold font-mono text-text-main">{presentCount}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Late Arrivals</div>
            <div className="text-xl font-bold font-mono text-text-main">{lateCount}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-rose/15 text-accent-rose flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Missing Checkout</div>
            <div className="text-xl font-bold font-mono text-text-main">{missingCount}</div>
          </div>
        </Card>
      </div>

      {/* Live Punch Terminal */}
      <CheckInWidget />

      {/* Filter Toolbar */}
      <div className="bg-surface-2 p-3.5 rounded-xl border border-border-subtle shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <Input 
              placeholder="Search employee..." 
              name="employeeSearch" 
              value={filters.employeeSearch} 
              onChange={handleFilterChange} 
              className="pl-9 bg-surface-3 border-border-subtle text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">From:</span>
            <Input 
              type="date" 
              name="dateFrom" 
              value={filters.dateFrom} 
              onChange={handleFilterChange} 
              className="bg-surface-3 border-border-subtle text-xs h-9 w-36"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">To:</span>
            <Input 
              type="date" 
              name="dateTo" 
              value={filters.dateTo} 
              onChange={handleFilterChange} 
              className="bg-surface-3 border-border-subtle text-xs h-9 w-36"
            />
          </div>

          <Select 
            name="status" 
            value={filters.status} 
            onChange={handleFilterChange}
            className="bg-surface-3 border-border-subtle text-xs h-9 w-40"
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="Overtime">Overtime</option>
            <option value="Missing Checkout">Missing Checkout</option>
          </Select>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-surface-2 border border-border-subtle rounded-xl overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-12 text-center text-text-muted flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
            <span className="text-xs">Loading attendance logs...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-accent-rose">Error loading attendance data.</div>
        ) : !records?.length ? (
          <EmptyState 
            icon={Calendar}
            title="No attendance records"
            description="No check-ins or biometric records match the selected date window or search query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-1 text-text-muted font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4 text-center">Worked Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {records.map((record) => (
                  <tr 
                    key={record.id} 
                    onClick={() => setSelectedRecord(record)} 
                    className="hover:bg-surface-3/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <AvatarBadge name={record.employeeName} imageUrl={record.employeeAvatar} size="sm" />
                        <div>
                          <div className="font-semibold text-text-main group-hover:text-accent-blue transition-colors">
                            {record.employeeName}
                          </div>
                          <div className="text-[11px] text-text-muted font-mono">{record.employeeId || 'Staff'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {formatDate(record.date)}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {formatTime(record.checkIn)}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {formatTime(record.checkOut)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {record.workedHours ? (
                        <span className="px-2 py-0.5 rounded bg-surface-3 text-text-main font-semibold border border-border-subtle">
                          {record.workedHours} hrs
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusPill status={record.status || 'Present'} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setSelectedRecord(record); 
                        }}
                        className="h-7 px-2 text-xs text-text-muted hover:text-accent-blue gap-1"
                      >
                        <Edit2 size={12} />
                        <span>Correct</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRecord && (
        <AttendanceDetailModal 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
        />
      )}
    </div>
  );
}
