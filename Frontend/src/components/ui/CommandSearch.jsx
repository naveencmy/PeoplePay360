import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Users, CalendarCheck, CalendarDays, WalletCards, 
  SlidersHorizontal, BrainCircuit, Shield, User, ArrowRight, X, Plus
} from 'lucide-react';

export const CommandSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const items = [
    // Navigation Modules
    { id: 'm-dash', title: 'Dashboard', category: 'Navigation', icon: WalletCards, path: '/dashboard' },
    { id: 'm-emp', title: 'All Employees', category: 'Navigation', icon: Users, path: '/employees' },
    { id: 'm-con', title: 'Contracts', category: 'Navigation', icon: Users, path: '/contracts' },
    { id: 'm-att', title: 'Attendance Tracker', category: 'Navigation', icon: CalendarCheck, path: '/attendance' },
    { id: 'm-tim', title: 'Time Off & Leave Requests', category: 'Navigation', icon: CalendarDays, path: '/time-off' },
    { id: 'm-pay', title: 'Payruns & Processing', category: 'Navigation', icon: WalletCards, path: '/payruns' },
    { id: 'm-slp', title: 'Employee Payslips', category: 'Navigation', icon: WalletCards, path: '/payslips' },
    { id: 'm-str', title: 'Salary Structures & Rule Graph', category: 'Navigation', icon: SlidersHorizontal, path: '/salary-structures' },
    { id: 'm-sim', title: 'Payroll What-If Simulator', category: 'Navigation', icon: SlidersHorizontal, path: '/simulator' },
    { id: 'm-int', title: 'Payroll Intelligence Center', category: 'Navigation', icon: BrainCircuit, path: '/intelligence' },
    { id: 'm-mys', title: 'My Space Self-Service', category: 'Navigation', icon: User, path: '/my-space' },
    { id: 'm-adm', title: 'Admin & User Access', category: 'Navigation', icon: Shield, path: '/admin/users' },

    // Quick Actions
    { id: 'a-emp', title: 'Add New Employee', category: 'Quick Action', icon: Plus, path: '/employees' },
    { id: 'a-run', title: 'Run Payroll Cycle', category: 'Quick Action', icon: Plus, path: '/payruns' },
    { id: 'a-lev', title: 'Request Time Off', category: 'Quick Action', icon: Plus, path: '/time-off' },
    { id: 'a-sim', title: 'Simulate Salary Hike', category: 'Quick Action', icon: SlidersHorizontal, path: '/simulator' },

    // Employees Samples
    { id: 'e-1', title: 'Rahul Sharma (Frontend Engineer)', category: 'Employees', icon: Users, path: '/employees/EMP-001' },
    { id: 'e-2', title: 'Priya Patel (Backend Engineer)', category: 'Employees', icon: Users, path: '/employees/EMP-002' },
    { id: 'e-3', title: 'Amit Singh (Engineering Manager)', category: 'Employees', icon: Users, path: '/employees/EMP-003' },
    { id: 'e-5', title: 'Vikram Malhotra (Sales Manager)', category: 'Employees', icon: Users, path: '/employees/EMP-005' },

    // Payruns Samples
    { id: 'p-1', title: 'July 2024 Payroll (Paid)', category: 'Payruns', icon: WalletCards, path: '/payruns/PR-001' },
    { id: 'p-2', title: 'August 2024 Payroll (Validated)', category: 'Payruns', icon: WalletCards, path: '/payruns/PR-002' },
    { id: 'p-3', title: 'September 2024 Payroll (Draft)', category: 'Payruns', icon: WalletCards, path: '/payruns/PR-003' },
  ];

  const filtered = items.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex justify-center items-start animate-fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Palette Modal */}
      <div 
        className="relative w-full max-w-2xl bg-surface-2 border border-border-medium rounded-2xl shadow-dropdown overflow-hidden z-10 animate-scale-in"
        onKeyDown={handleKeyDown}
      >
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-border-subtle bg-surface-1">
          <Search className="w-5 h-5 text-accent-blue mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-text-main placeholder-text-muted outline-none text-base font-medium"
            placeholder="Search employees, payruns, salary rules, or modules... (ESC to exit)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
          />
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-text-muted bg-surface-3 rounded border border-border-subtle">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-border-subtle/40">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-text-muted">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No results found for "{query}"</p>
              <p className="text-xs text-text-muted mt-1">Try searching for employees, payruns, or modules.</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-main hover:bg-surface-3'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-accent-blue text-white' : 'bg-surface-3 text-text-muted'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-[11px] text-text-muted">{item.category}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex items-center text-xs font-semibold gap-1 text-accent-blue">
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border-subtle bg-surface-1/70 flex items-center justify-between text-[11px] text-text-muted">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="px-1.5 py-0.5 bg-surface-3 rounded border border-border-subtle">↑</kbd> <kbd className="px-1.5 py-0.5 bg-surface-3 rounded border border-border-subtle">↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-surface-3 rounded border border-border-subtle">↵</kbd> to select</span>
          </div>
          <span>PeoplePay360 Intelligence</span>
        </div>
      </div>
    </div>
  );
};

export default CommandSearch;
