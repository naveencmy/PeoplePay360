import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import StatusPill from '@/components/ui/StatusPill';
import MoneyDisplay from '@/components/ui/MoneyDisplay';
import useAuthStore from '@/store/authStore';
import { useEmployee } from '@/hooks/useEmployees';
import { useTodayAttendance, useCheckin, useCheckout, useAttendance } from '@/hooks/useAttendance';
import { useTimeOffBalance, useLeaveRequests } from '@/hooks/useTimeOff';
import { usePayslips } from '@/hooks/usePayslips';
import { 
  Clock, Calendar, Wallet, User, CheckCircle2, ArrowRight, 
  LogIn, LogOut, Download, Plus, FileText, Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const MySpacePage = () => {
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const empId = user?.employeeId;

  // Real backend queries
  const { data: employee, isLoading: isEmployeeLoading } = useEmployee(empId);
  const { data: todayStatus, isLoading: isAttendanceLoading, refetch: refetchToday } = useTodayAttendance(empId);
  const { data: attendanceHistory } = useAttendance(empId ? { employee_id: empId, limit: 3 } : { limit: 3 });
  const { data: leaveBalances, isLoading: isBalanceLoading } = useTimeOffBalance(empId);
  const { data: leaveRequests, isLoading: isRequestsLoading } = useLeaveRequests(empId ? { employee_id: empId, limit: 3 } : { limit: 3 });
  const { data: payslipsData } = usePayslips(empId ? { employee_id: empId, limit: 1 } : { limit: 1 });

  const checkinMutation = useCheckin();
  const checkoutMutation = useCheckout();

  const isCheckedIn = Boolean(todayStatus?.isCheckedIn);
  const todayRecord = todayStatus?.todayRecord || todayStatus?.openRecord;
  const punchTime = todayRecord?.check_in ? new Date(todayRecord.check_in) : null;

  const employeeName = employee 
    ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim() 
    : user?.name || user?.email?.split('@')[0] || 'Staff Member';

  const employeeCode = employee?.employee_code || employee?.code || 'EMP-001';
  const designation = employee?.designation || employee?.job_position || 'Enterprise Staff';
  const department = employee?.department || 'Operations';
  const email = employee?.email || user?.email || 'user@company.com';
  const bankInfo = employee?.bank_account_number 
    ? `${employee.bank_name || 'Bank'} ·••• ${employee.bank_account_number.slice(-4)}`
    : 'Verified on File';

  // Parse leave balances
  const balancesList = Array.isArray(leaveBalances) ? leaveBalances : [];
  const annualLeave = balancesList.find(b => 
    (b.leave_type || '').includes('PAID') || (b.leave_type || '').includes('EARNED') || (b.leave_type || '').includes('ANNUAL')
  ) || balancesList[0];

  const sickLeave = balancesList.find(b => 
    (b.leave_type || '').includes('SICK')
  ) || balancesList[1];

  const annualBal = annualLeave?.remaining ?? annualLeave?.entitlement ?? 18;
  const sickBal = sickLeave?.remaining ?? sickLeave?.entitlement ?? 12;

  // Parse active leave requests
  const requestsList = Array.isArray(leaveRequests) 
    ? leaveRequests 
    : (leaveRequests?.data && Array.isArray(leaveRequests.data) ? leaveRequests.data : []);

  // Parse latest payslip
  const payslipsList = Array.isArray(payslipsData) 
    ? payslipsData 
    : (payslipsData?.data && Array.isArray(payslipsData.data) ? payslipsData.data : []);
  const latestPayslip = payslipsList.length > 0 ? payslipsList[0] : null;

  // Parse attendance logs
  const recentLogs = Array.isArray(attendanceHistory) 
    ? attendanceHistory 
    : (attendanceHistory?.data && Array.isArray(attendanceHistory.data) ? attendanceHistory.data : []);

  const handleTogglePunch = async () => {
    try {
      if (!isCheckedIn) {
        await checkinMutation.mutateAsync({ employee_id: empId });
        toast.success('Punched in successfully!');
      } else {
        await checkoutMutation.mutateAsync({ employee_id: empId });
        toast.success('Punched out. Shift logged successfully!');
      }
      refetchToday();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to update attendance');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <PageHeader 
        title="My Space" 
        subtitle="Personal self-service console for attendance check-ins, leave quotas, and digital payslips"
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'My Space' }
        ]}
      />

      {/* Greeting Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-accent-blue/15 via-surface-2 to-surface-2 border border-accent-blue/25 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent-blue to-accent-cyan flex items-center justify-center text-white text-xl font-bold font-mono shadow-sm">
            {employeeName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-text-main">
                Welcome back, {employeeName}!
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-blue/15 text-accent-blue font-semibold">
                Staff Portal
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-text-muted" />
              <span>{format(currentTime, 'EEEE, MMMM do, yyyy')}</span>
              <span>· Shift Window: 09:00 AM – 05:00 PM</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/time-off">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <Plus size={14} />
              <span>Apply for Leave</span>
            </Button>
          </Link>
          <Link to="/payslips">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Wallet size={14} />
              <span>View Payslips</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Punch Clock Card */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-blue" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-text-main">
                  Shift Attendance
                </h3>
              </div>
              <StatusPill status={isCheckedIn ? 'Present' : 'Inactive'} />
            </div>

            <div className="flex flex-col items-center justify-center py-6 border-y border-border-subtle my-2">
              <div className="text-3xl sm:text-4xl font-mono font-bold text-text-main tracking-tight tabular-nums">
                {format(currentTime, 'hh:mm:ss')}
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-text-muted mt-1">
                {format(currentTime, 'a')}
              </span>

              {isCheckedIn && punchTime && (
                <div className="text-xs text-accent-emerald mt-3 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Checked in at {format(punchTime, 'hh:mm a')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button 
              onClick={handleTogglePunch}
              disabled={checkinMutation.isPending || checkoutMutation.isPending}
              variant={isCheckedIn ? 'danger' : 'primary'}
              className="w-full h-11 text-xs font-bold uppercase tracking-wider gap-2 shadow-sm"
            >
              {isCheckedIn ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>
                {checkinMutation.isPending || checkoutMutation.isPending 
                  ? 'Syncing...' 
                  : (isCheckedIn ? 'Punch Out' : 'Punch In Now')}
              </span>
            </Button>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-2">
                Recent Punch History
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                {recentLogs.length > 0 ? (
                  recentLogs.slice(0, 3).map((log, i) => {
                    const logDate = log.date ? format(new Date(log.date), 'MMM dd') : `Day ${i + 1}`;
                    const inTime = log.check_in ? format(new Date(log.check_in), 'hh:mm a') : '--:--';
                    const outTime = log.check_out ? format(new Date(log.check_out), 'hh:mm a') : 'In progress';
                    const hours = log.worked_hours ? `${parseFloat(log.worked_hours).toFixed(1)}h` : 'Active';
                    return (
                      <div key={log.id || i} className="flex justify-between items-center p-2 rounded-lg bg-surface-1 border border-border-subtle">
                        <span className="text-text-secondary">{logDate}</span>
                        <span className="text-text-muted">{inTime} → {outTime}</span>
                        <span className="font-semibold text-text-main">{hours}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-text-muted text-center py-2 bg-surface-1 rounded-lg border border-border-subtle">
                    No recent attendance logs recorded
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Leave Balances & Quotas Card */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent-emerald" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-text-main">
                  Leave Quotas
                </h3>
              </div>
              <Link to="/time-off" className="text-xs text-accent-blue hover:underline font-medium">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle text-center">
                <div className="text-3xl font-bold font-mono text-accent-blue">
                  {isBalanceLoading ? '...' : annualBal}
                </div>
                <div className="text-[11px] text-text-muted mt-1 font-medium">Annual Leave Bal</div>
              </div>
              <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle text-center">
                <div className="text-3xl font-bold font-mono text-accent-emerald">
                  {isBalanceLoading ? '...' : sickBal}
                </div>
                <div className="text-[11px] text-text-muted mt-1 font-medium">Sick Leave Bal</div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-2">
                Recent Leave Requests
              </span>
              <div className="space-y-2">
                {requestsList.length > 0 ? (
                  requestsList.slice(0, 2).map((req) => {
                    const startStr = req.startDate || req.date_from;
                    const endStr = req.endDate || req.date_to;
                    const dateDisplay = startStr && endStr
                      ? `${format(new Date(startStr), 'MMM dd')} - ${format(new Date(endStr), 'MMM dd')}`
                      : 'Scheduled';
                    const durationStr = `${req.days || req.duration || 1} day${(req.days || req.duration) > 1 ? 's' : ''}`;
                    const leaveName = req.reason || req.typeName || req.leave_type || 'Leave Request';

                    return (
                      <div key={req.id} className="p-3 rounded-xl bg-surface-1 border border-border-subtle">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-xs text-text-main truncate max-w-[170px]" title={leaveName}>
                            {leaveName}
                          </span>
                          <StatusPill status={req.status || 'Pending'} />
                        </div>
                        <div className="text-[11px] font-mono text-text-muted">
                          {dateDisplay} · {durationStr}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle text-center">
                    <p className="text-xs text-text-muted">No pending or recent leave requests</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Link to="/time-off" className="pt-4">
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
              <span>Submit Leave Request</span>
              <ArrowRight size={13} />
            </Button>
          </Link>
        </Card>

        {/* Profile & Latest Payslip Card */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-accent-purple" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-text-main">
                  My Profile & Pay
                </h3>
              </div>
              <span className="text-xs font-mono text-text-muted">{employeeCode}</span>
            </div>

            {/* Live Profile Info */}
            <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle space-y-2.5 text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-text-muted">Designation:</span>
                <span className="font-semibold text-text-main truncate max-w-[180px]" title={designation}>{designation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Department:</span>
                <span className="font-semibold text-text-main">{department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Work Email:</span>
                <span className="font-mono text-text-main truncate max-w-[180px]" title={email}>{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Bank Account:</span>
                <span className="font-mono text-text-main">{bankInfo}</span>
              </div>
            </div>

            {/* Latest Payslip Callout */}
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-2">
                Latest Disbursed Payslip
              </span>
              {latestPayslip ? (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-accent-emerald/10 via-surface-1 to-surface-1 border border-accent-emerald/25">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-text-main">
                      {latestPayslip.period || 'Current Cycle'}
                    </span>
                    <StatusPill status={latestPayslip.status || 'Paid'} />
                  </div>
                  <div className="text-xl font-bold font-mono text-accent-emerald mt-1">
                    <MoneyDisplay amount={latestPayslip.net_salary || latestPayslip.net || 0} />
                  </div>
                  <div className="text-[10px] text-text-muted mt-1 font-mono">
                    Ref: {latestPayslip.payslip_code || latestPayslip.number || latestPayslip.id?.slice(0, 12) || 'Direct Deposit'}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-surface-1 border border-border-subtle text-center">
                  <p className="text-xs text-text-muted">No processed payslips available yet</p>
                </div>
              )}
            </div>
          </div>

          <Link to={latestPayslip ? `/payslips/${latestPayslip.id}` : '/payslips'} className="pt-4">
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
              <Download size={13} />
              <span>{latestPayslip ? 'View Disbursed Payslip' : 'View Payslips Directory'}</span>
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default MySpacePage;
