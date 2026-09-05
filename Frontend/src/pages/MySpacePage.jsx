import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import StatusPill from '@/components/ui/StatusPill';
import MoneyDisplay from '@/components/ui/MoneyDisplay';
import useAuthStore from '@/store/authStore';
import { 
  Clock, Calendar, Wallet, User, CheckCircle2, ArrowRight, 
  LogIn, LogOut, Download, Mail, Phone, ShieldCheck, Plus 
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const MySpacePage = () => {
  const { user } = useAuthStore();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [punchTime, setPunchTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const employeeName = user?.name || "Alex";

  const handleTogglePunch = () => {
    if (!isCheckedIn) {
      setIsCheckedIn(true);
      setPunchTime(new Date());
      toast.success('Punched in successfully!');
    } else {
      setIsCheckedIn(false);
      toast.success('Punched out. Shift logged successfully!');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <PageHeader 
        title="My Space" 
        subtitle="Personal self-service console for attendance check-ins, leave requests, and digital payslips"
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
              variant={isCheckedIn ? 'danger' : 'primary'}
              className="w-full h-11 text-xs font-bold uppercase tracking-wider gap-2 shadow-sm"
            >
              {isCheckedIn ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>{isCheckedIn ? 'Punch Out' : 'Punch In Now'}</span>
            </Button>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-2">
                Recent Punch History
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                {[
                  { date: 'Yesterday', in: '09:02 AM', out: '05:32 PM', status: '8.5h' },
                  { date: '2 days ago', in: '08:58 AM', out: '05:15 PM', status: '8.2h' },
                  { date: '3 days ago', in: '09:05 AM', out: '05:00 PM', status: '8.0h' }
                ].map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-surface-1 border border-border-subtle">
                    <span className="text-text-secondary">{log.date}</span>
                    <span className="text-text-muted">{log.in} → {log.out}</span>
                    <span className="font-semibold text-text-main">{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Leave Balances Card */}
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
                <div className="text-3xl font-bold font-mono text-accent-blue">14</div>
                <div className="text-[11px] text-text-muted mt-1 font-medium">Annual Leave Bal</div>
              </div>
              <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle text-center">
                <div className="text-3xl font-bold font-mono text-accent-emerald">6</div>
                <div className="text-[11px] text-text-muted mt-1 font-medium">Sick Leave Bal</div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-2">
                Active Requests
              </span>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-surface-1 border border-border-subtle">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-xs text-text-main">Diwali Festival Leave</span>
                    <StatusPill status="Pending" />
                  </div>
                  <div className="text-[11px] font-mono text-text-muted">
                    Oct 28 - Oct 30 · 3 days
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-1 border border-border-subtle">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-xs text-text-main">Medical Checkup</span>
                    <StatusPill status="Approved" />
                  </div>
                  <div className="text-[11px] font-mono text-text-muted">
                    Sep 15 · 1 day
                  </div>
                </div>
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
              <span className="text-xs font-mono text-text-muted">EMP-001</span>
            </div>

            {/* Quick Profile Info */}
            <div className="p-4 rounded-xl bg-surface-1 border border-border-subtle space-y-2.5 text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-text-muted">Designation:</span>
                <span className="font-semibold text-text-main">Lead Software Engineer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Department:</span>
                <span className="font-semibold text-text-main">Core Platform</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Work Email:</span>
                <span className="font-mono text-text-main">{user?.email || 'alex@company.com'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Bank Account:</span>
                <span className="font-mono text-text-main">HDFC ·••• 4821</span>
              </div>
            </div>

            {/* Latest Payslip Callout */}
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-2">
                Latest Disbursed Payslip
              </span>
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-accent-emerald/10 via-surface-1 to-surface-1 border border-accent-emerald/25">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-text-main">October 2026</span>
                  <StatusPill status="Paid" />
                </div>
                <div className="text-xl font-bold font-mono text-accent-emerald mt-1">
                  ₹1,05,600.00
                </div>
                <div className="text-[10px] text-text-muted mt-1">
                  Disbursed on Oct 30, 2026 via NEFT
                </div>
              </div>
            </div>
          </div>

          <Link to="/payslips/1" className="pt-4">
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
              <Download size={13} />
              <span>Download Latest Paystub</span>
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default MySpacePage;
