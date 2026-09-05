import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, CalendarCheck, CalendarDays, WalletCards, SlidersHorizontal, 
  BrainCircuit, Bell, Search, ChevronDown, User, Shield, LogOut,
  Sparkles, Menu, X, Plus
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import ThemeToggle from '@/components/ui/ThemeToggle';
import StatusPill from '@/components/ui/StatusPill';

export default function TopBar({ onOpenCommandSearch }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="h-14 bg-surface-1 border-b border-border-subtle flex items-center px-4 sm:px-6 justify-between shrink-0 sticky top-0 z-30 transition-colors">
      {/* LEFT: Brand Logo */}
      <div className="flex items-center gap-6 lg:gap-8">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-blue to-accent-cyan p-0.5 shadow-sm group-hover:shadow-glow transition-all">
            <div className="w-full h-full bg-surface-1 rounded-[7px] flex items-center justify-center font-bold text-xs text-accent-blue font-mono">
              P3
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-text-main flex items-center gap-1.5">
              PeoplePay<span className="text-accent-blue">360</span>
            </span>
            <span className="text-[9px] font-semibold text-text-muted tracking-widest uppercase -mt-0.5 hidden sm:block">
              Enterprise
            </span>
          </div>
        </Link>

        {/* CENTER: Primary Navigation */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-medium">
          {/* Employees Dropdown */}
          <div className="group relative">
            <button 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/employees') || isActive('/contracts') || isActive('/schedules')
                  ? 'bg-accent-blue/10 text-accent-blue font-semibold'
                  : 'text-text-secondary hover:text-text-main hover:bg-surface-3'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Employees</span>
              <ChevronDown className="w-3 h-3 text-text-muted transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-0 mt-1 bg-surface-3 border border-border-medium rounded-xl shadow-dropdown py-1.5 min-w-[210px] hidden group-hover:block z-50 animate-fade-in">
              <Link to="/employees" className="block px-3.5 py-2 text-xs text-text-main hover:bg-surface-2 transition-colors">
                <div className="font-medium">All Employees</div>
                <div className="text-[10px] text-text-muted">Directory, profiles & hierarchy</div>
              </Link>
              <Link to="/contracts" className="block px-3.5 py-2 text-xs text-text-main hover:bg-surface-2 transition-colors">
                <div className="font-medium">Contracts</div>
                <div className="text-[10px] text-text-muted">Terms, wages & structures</div>
              </Link>
              <Link to="/schedules" className="block px-3.5 py-2 text-xs text-text-main hover:bg-surface-2 transition-colors">
                <div className="font-medium">Working Schedules</div>
                <div className="text-[10px] text-text-muted">Shift timings & weekly hours</div>
              </Link>
            </div>
          </div>

          {/* Attendance */}
          <Link 
            to="/attendance" 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/attendance')
                ? 'bg-accent-blue/10 text-accent-blue font-semibold'
                : 'text-text-secondary hover:text-text-main hover:bg-surface-3'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Attendance</span>
          </Link>

          {/* Time Off Dropdown */}
          <div className="group relative">
            <button 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/time-off')
                  ? 'bg-accent-blue/10 text-accent-blue font-semibold'
                  : 'text-text-secondary hover:text-text-main hover:bg-surface-3'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Time Off</span>
              <ChevronDown className="w-3 h-3 text-text-muted transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-0 mt-1 bg-surface-3 border border-border-medium rounded-xl shadow-dropdown py-1.5 min-w-[200px] hidden group-hover:block z-50 animate-fade-in">
              <Link to="/time-off" className="block px-3.5 py-2 text-xs text-text-main hover:bg-surface-2 transition-colors">
                <div className="font-medium">Leave Requests</div>
                <div className="text-[10px] text-text-muted">Pending, approved & history</div>
              </Link>
              <Link to="/time-off/allocations" className="block px-3.5 py-2 text-xs text-text-main hover:bg-surface-2 transition-colors">
                <div className="font-medium">Leave Allocations</div>
                <div className="text-[10px] text-text-muted">Balance & annual allowances</div>
              </Link>
              <Link to="/time-off/types" className="block px-3.5 py-2 text-xs text-text-main hover:bg-surface-2 transition-colors">
                <div className="font-medium">Leave Policies</div>
                <div className="text-[10px] text-text-muted">Types, rules & encashment</div>
              </Link>
            </div>
          </div>

          {/* Payroll Dropdown */}
          <div className="group relative">
            <button 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/payruns') || isActive('/payslips') || isActive('/salary-structures') || isActive('/dashboard')
                  ? 'bg-accent-blue/10 text-accent-blue font-semibold'
                  : 'text-text-secondary hover:text-text-main hover:bg-surface-3'
              }`}
            >
              <WalletCards className="w-4 h-4" />
              <span>Payroll</span>
              <ChevronDown className="w-3 h-3 text-text-muted transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-0 mt-1 bg-surface-3 border border-border-medium rounded-xl shadow-dropdown py-1.5 min-w-[220px] hidden group-hover:block z-50 animate-fade-in">
              <Link to="/dashboard" className="block px-3.5 py-2 text-xs text-text-main hover:bg-surface-2 transition-colors">
                <div className="font-medium">Dashboard</div>
                <div className="text-[10px] text-text-muted">Financial KPIs & analytics</div>
              </Link>
              <Link to="/payruns" className="block px-3.5 py-2 text-xs text-text-main hover:bg-surface-2 transition-colors">
                <div className="font-medium">Payruns & Processing</div>
                <div className="text-[10px] text-text-muted">Draft, computed & validated cycles</div>
              </Link>
              <Link to="/payslips" className="block px-3.5 py-2 text-xs text-text-main hover:bg-surface-2 transition-colors">
                <div className="font-medium">Payslips</div>
                <div className="text-[10px] text-text-muted">Digital statements & PDF export</div>
              </Link>
              <Link to="/salary-structures" className="block px-3.5 py-2 text-xs text-text-main hover:bg-surface-2 transition-colors">
                <div className="font-medium">Salary Structures & Rules</div>
                <div className="text-[10px] text-text-muted">Formula engine & dependency graph</div>
              </Link>
            </div>
          </div>

          {/* Simulator */}
          <Link 
            to="/simulator" 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/simulator')
                ? 'bg-accent-blue/10 text-accent-blue font-semibold'
                : 'text-text-secondary hover:text-text-main hover:bg-surface-3'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Simulator</span>
            <span className="bg-accent-blue/15 text-accent-blue text-[10px] px-1.5 py-0.2 rounded uppercase font-bold tracking-wider">
              Model
            </span>
          </Link>

          {/* Intelligence Hub */}
          <Link 
            to="/intelligence" 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/intelligence')
                ? 'bg-accent-purple/15 text-accent-purple font-semibold'
                : 'text-text-secondary hover:text-text-main hover:bg-surface-3'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-accent-purple" />
            <span>Intelligence</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-purple opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-purple"></span>
            </span>
          </Link>
        </nav>
      </div>

      {/* RIGHT: Actions, Search, Theme, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Universal Command Search Button */}
        <button
          onClick={onOpenCommandSearch}
          className="hidden md:flex items-center gap-2 px-2.5 py-1.5 bg-surface-2 hover:bg-surface-3 border border-border-medium rounded-lg text-text-muted hover:text-text-main transition-colors text-xs"
          title="Search anything (⌘K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-text-muted">Search...</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-surface-1 rounded border border-border-subtle text-text-muted">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-text-secondary hover:text-text-main hover:bg-surface-3 transition-colors border border-transparent hover:border-border-subtle"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-blue rounded-full"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-3 border border-border-medium rounded-xl shadow-dropdown py-2 z-50 animate-scale-in">
              <div className="px-4 py-2 border-b border-border-subtle flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text-main">Notifications</span>
                <span className="text-[10px] text-accent-blue cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-border-subtle">
                <div className="p-3 hover:bg-surface-2 text-xs transition-colors cursor-pointer">
                  <div className="font-semibold text-text-main">August 2024 Payrun Validated</div>
                  <div className="text-[11px] text-text-muted mt-0.5">22 employees ready for disbursement.</div>
                  <div className="text-[10px] text-text-muted/60 mt-1">2 hours ago</div>
                </div>
                <div className="p-3 hover:bg-surface-2 text-xs transition-colors cursor-pointer">
                  <div className="font-semibold text-text-main">2 Anomaly Alerts Detected</div>
                  <div className="text-[11px] text-accent-amber mt-0.5">Salary deviation exceeds 20% threshold.</div>
                  <div className="text-[10px] text-text-muted/60 mt-1">5 hours ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="group relative cursor-pointer">
          <div className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-2 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-accent-blue to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-text-main leading-tight truncate max-w-[100px]">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider">
                {user?.role || 'Admin'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-text-muted hidden sm:block" />
          </div>

          {/* Profile Dropdown */}
          <div className="absolute top-full right-0 mt-1 bg-surface-3 border border-border-medium rounded-xl shadow-dropdown py-1.5 min-w-[200px] hidden group-hover:block z-50 animate-fade-in">
            <div className="px-4 py-2 border-b border-border-subtle">
              <div className="text-xs font-bold text-text-main">{user?.name || 'User'}</div>
              <div className="text-[11px] text-text-muted truncate">{user?.email || 'admin@peoplepay360.com'}</div>
              <div className="mt-1.5">
                <StatusPill size="xs" status={user?.role === 'admin' ? 'Admin Access' : 'Employee Access'} />
              </div>
            </div>
            <Link to="/my-space" className="flex items-center gap-2.5 px-4 py-2 text-xs text-text-main hover:bg-surface-2 transition-colors">
              <User className="w-3.5 h-3.5 text-accent-blue" />
              <span>My Space (Self-Service)</span>
            </Link>
            <Link to="/admin/users" className="flex items-center gap-2.5 px-4 py-2 text-xs text-text-main hover:bg-surface-2 transition-colors">
              <Shield className="w-3.5 h-3.5 text-accent-purple" />
              <span>User Administration</span>
            </Link>
            <div className="border-t border-border-subtle my-1"></div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-accent-rose hover:bg-surface-2 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 rounded-lg text-text-secondary hover:text-text-main hover:bg-surface-3 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-0 top-14 bg-surface-2 border-b border-border-medium shadow-dropdown p-4 z-40 space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <Link onClick={() => setMobileMenuOpen(false)} to="/dashboard" className="p-2.5 rounded-lg bg-surface-3 hover:bg-surface-1 flex items-center gap-2">
              <WalletCards className="w-4 h-4 text-accent-blue" /> Dashboard
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/employees" className="p-2.5 rounded-lg bg-surface-3 hover:bg-surface-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent-blue" /> Employees
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/contracts" className="p-2.5 rounded-lg bg-surface-3 hover:bg-surface-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent-blue" /> Contracts
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/schedules" className="p-2.5 rounded-lg bg-surface-3 hover:bg-surface-1 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-accent-blue" /> Schedules
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/attendance" className="p-2.5 rounded-lg bg-surface-3 hover:bg-surface-1 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-accent-emerald" /> Attendance
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/time-off" className="p-2.5 rounded-lg bg-surface-3 hover:bg-surface-1 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-accent-cyan" /> Time Off
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/payruns" className="p-2.5 rounded-lg bg-surface-3 hover:bg-surface-1 flex items-center gap-2">
              <WalletCards className="w-4 h-4 text-accent-blue" /> Payruns
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/payslips" className="p-2.5 rounded-lg bg-surface-3 hover:bg-surface-1 flex items-center gap-2">
              <WalletCards className="w-4 h-4 text-accent-blue" /> Payslips
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/salary-structures" className="p-2.5 rounded-lg bg-surface-3 hover:bg-surface-1 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-accent-blue" /> Rules
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/simulator" className="p-2.5 rounded-lg bg-surface-3 hover:bg-surface-1 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-accent-purple" /> Simulator
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/intelligence" className="p-2.5 rounded-lg bg-surface-3 hover:bg-surface-1 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-accent-purple" /> Intelligence
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} to="/my-space" className="p-2.5 rounded-lg bg-surface-3 hover:bg-surface-1 flex items-center gap-2">
              <User className="w-4 h-4 text-text-muted" /> My Space
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
