import React, { useState, useEffect } from 'react';
import { Card, Button, StatusPill } from '@/components/ui';
import { useCheckin, useCheckout, useTodayAttendance } from '@/hooks/useAttendance';
import useAuthStore from '@/store/authStore';
import { format, differenceInMinutes } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CheckInWidget() {
  const { user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState('idle'); // idle, checked-in, checked-out
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);

  const { data: todayStatus } = useTodayAttendance(user?.employeeId);
  const checkinMutation = useCheckin();
  const checkoutMutation = useCheckout();

  const scheduleStart = new Date();
  scheduleStart.setHours(9, 0, 0, 0); // 9:00 AM expected start

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (todayStatus) {
      if (todayStatus.openRecord) {
        setStatus('checked-in');
        setCheckInTime(new Date(todayStatus.openRecord.check_in));
      } else if (todayStatus.todayRecord && todayStatus.todayRecord.check_out) {
        setStatus('checked-out');
        setCheckInTime(new Date(todayStatus.todayRecord.check_in));
        setCheckOutTime(new Date(todayStatus.todayRecord.check_out));
      } else {
        setStatus('idle');
      }
    }
  }, [todayStatus]);

  const handleCheckIn = async () => {
    try {
      const now = new Date();
      await checkinMutation.mutateAsync({
        employee_id: user?.employeeId,
        time: now.toISOString(),
      });
      setCheckInTime(now);
      setStatus('checked-in');
      
      const isLate = differenceInMinutes(now, scheduleStart) > 30;
      toast.success(`Checked in successfully${isLate ? ' (Late arrival flagged)' : ''}!`);
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to check in';
      toast.error(msg);
    }
  };

  const handleCheckOut = async () => {
    try {
      const now = new Date();
      await checkoutMutation.mutateAsync({
        employee_id: user?.employeeId,
        time: now.toISOString(),
      });
      setCheckOutTime(now);
      setStatus('checked-out');
      toast.success('Shift completed and checked out successfully!');
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to check out';
      toast.error(msg);
    }
  };

  const getWorkedTime = () => {
    if (!checkInTime || !checkOutTime) return '';
    const diffMs = checkOutTime - checkInTime;
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m`;
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-surface-2 via-surface-2 to-surface-3/50 border border-border-subtle shadow-card relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-emerald"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Live Biometric & Shift Terminal
            </span>
          </div>

          <div className="flex items-baseline gap-3 pt-1">
            <div className="text-3xl sm:text-4xl font-mono font-bold text-text-main tracking-tight tabular-nums">
              {format(currentTime, 'hh:mm:ss')}
            </div>
            <span className="text-sm font-mono font-semibold text-text-muted uppercase">
              {format(currentTime, 'a')}
            </span>
          </div>

          <p className="text-xs text-text-secondary flex items-center gap-1.5 pt-0.5">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
            <span>{format(currentTime, 'EEEE, MMMM do, yyyy')}</span>
            <span className="text-text-muted">· Shift: 09:00 AM – 05:00 PM (8h)</span>
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
          {status === 'idle' && (
            <Button 
              size="lg" 
              variant="primary"
              className="bg-accent-emerald hover:bg-emerald-600 text-white min-w-[200px] h-12 gap-2 shadow-glow text-sm font-bold uppercase tracking-wider"
              onClick={handleCheckIn}
              isLoading={checkinMutation.isLoading}
            >
              <LogIn className="w-4 h-4" />
              <span>Punch In Now</span>
            </Button>
          )}

          {status === 'checked-in' && (
            <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
              <Button 
                size="lg" 
                variant="danger"
                className="min-w-[200px] h-12 gap-2 shadow-sm text-sm font-bold uppercase tracking-wider"
                onClick={handleCheckOut}
                isLoading={checkoutMutation.isLoading}
              >
                <LogOut className="w-4 h-4" />
                <span>Punch Out</span>
              </Button>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span>Punched in at <strong className="font-mono text-text-main">{format(checkInTime, 'hh:mm a')}</strong></span>
                {differenceInMinutes(checkInTime, scheduleStart) > 30 && (
                  <StatusPill status="Late" />
                )}
              </div>
            </div>
          )}

          {status === 'checked-out' && (
            <div className="p-3.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-left md:text-right">
              <div className="text-accent-emerald font-semibold text-xs flex items-center md:justify-end gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Shift Logged Successfully</span>
              </div>
              <div className="text-xs text-text-secondary font-mono">
                {format(checkInTime, 'hh:mm a')} → {format(checkOutTime, 'hh:mm a')} ({getWorkedTime()})
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
