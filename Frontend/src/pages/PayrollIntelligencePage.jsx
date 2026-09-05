import React, { useState } from 'react';
import { 
  BrainCircuit, AlertTriangle, ShieldCheck, Sparkles, CheckCircle, 
  ArrowRight, Filter, Info, Eye, Clock, User, FileText, ChevronRight
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusPill from '@/components/ui/StatusPill';
import Drawer from '@/components/ui/Drawer';
import MoneyDisplay from '@/components/ui/MoneyDisplay';
import { useEmployees } from '@/hooks/useEmployees';

export default function PayrollIntelligencePage() {
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeItem, setActiveItem] = useState(null);
  const [resolvedIds, setResolvedIds] = useState(new Set());

  const intelligenceItems = [
    {
      id: 'INT-001',
      severity: 'HIGH',
      type: 'Variance',
      title: 'Net Salary Decreased by 35%',
      employeeName: 'Priya Patel',
      employeeId: 'EMP-002',
      department: 'Engineering',
      previousPay: 48000,
      currentPay: 31200,
      confidence: '98%',
      detectedAt: '2 hours ago',
      likelyFactors: [
        '3 days unpaid leave logged in August',
        'Special Allowance rule threshold not applied',
        'Income tax bracket recalculation'
      ],
      evidence: 'Comparing July payrun (Gross ₹50,000, Deductions ₹2,000) with August draft calculation (Gross ₹36,000, Deductions ₹4,800).',
      recommendation: 'Review unpaid leave approval LR-002 and verify HRA formula multiplier in Standard Payroll Structure.',
      status: 'Action Required'
    },
    {
      id: 'INT-002',
      severity: 'HIGH',
      type: 'Compliance',
      title: 'Circular Dependency Detected in Salary Structure',
      employeeName: 'Aarti Mukherjee',
      employeeId: 'EMP-022',
      department: 'Finance',
      previousPay: 65000,
      currentPay: 65000,
      confidence: '100%',
      detectedAt: '3 hours ago',
      likelyFactors: [
        'Structure STR-003 contains circular loop: GROSS -> BASIC -> HRA -> GROSS',
        'Formula engine cannot resolve topological sort order'
      ],
      evidence: 'Rule RUL-013 (GROSS = BASIC + HRA) references rule RUL-014 (BASIC = GROSS * 0.5).',
      recommendation: 'Break cycle in Structure STR-003 before executing next payrun cycle.',
      status: 'Critical Alert'
    },
    {
      id: 'INT-003',
      severity: 'MEDIUM',
      type: 'Contracts',
      title: 'Contract Expiring Within Current Payroll Period',
      employeeName: 'Rajesh Choudhary',
      employeeId: 'EMP-015',
      department: 'Sales',
      previousPay: 70000,
      currentPay: 70000,
      confidence: '95%',
      detectedAt: '1 day ago',
      likelyFactors: [
        'Contract CON-024 validity ends on August 31, 2024',
        'No renewal or extension contract found in system'
      ],
      evidence: 'End date in contract record is set to 2024-08-31 without a subsequent active contract.',
      recommendation: 'Draft replacement contract or extend end date before September payrun.',
      status: 'Pending Review'
    },
    {
      id: 'INT-004',
      severity: 'LOW',
      type: 'Attendance',
      title: 'Unusual Spike in Engineering Overtime (+24 hrs)',
      employeeName: 'Rahul Sharma',
      employeeId: 'EMP-001',
      department: 'Engineering',
      previousPay: 55000,
      currentPay: 61200,
      confidence: '88%',
      detectedAt: '1 day ago',
      likelyFactors: [
        'Weekend checkout ATT-31 shows 11 worked hours',
        '3 consecutive overtime days logged'
      ],
      evidence: 'Employee logged 44 total worked hours in week 32 vs standard 40 hours schedule.',
      recommendation: 'Confirm manager approval for overtime disbursement before finalizing payrun.',
      status: 'Informational'
    },
    {
      id: 'INT-005',
      severity: 'LOW',
      type: 'Compliance',
      title: 'Missing PAN Number for Statutory PF Filing',
      employeeName: 'Sneha Iyer',
      employeeId: 'EMP-012',
      department: 'HR',
      previousPay: 42000,
      currentPay: 42000,
      confidence: '100%',
      detectedAt: '2 days ago',
      likelyFactors: [
        'Employee profile onboarded without tax PAN record'
      ],
      evidence: 'PanNumber field is empty or contains temporary format in employee master table.',
      recommendation: 'Request PAN card copy from employee for Form 16 / TDS generation.',
      status: 'Informational'
    }
  ];

  const handleResolve = (id) => {
    setResolvedIds(prev => new Set([...prev, id]));
    setActiveItem(null);
  };

  const filteredItems = intelligenceItems.filter(item => {
    if (resolvedIds.has(item.id)) return false;
    if (selectedSeverity !== 'All' && item.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'All' && item.type !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Payroll / Intelligence Center"
        icon={BrainCircuit}
        title="Payroll Intelligence"
        subtitle="Autonomous anomaly detection and statistical variance engine. Flags potential risks before salary disbursement."
        badge={<span className="badge-pill bg-accent-purple/15 text-accent-purple border-accent-purple/30">AI Safeguards Active</span>}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={ShieldCheck}>
              Compliance Audit
            </Button>
            <Button variant="primary" size="sm" icon={Sparkles}>
              Run Intelligence Scan
            </Button>
          </div>
        }
      />

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface-2 border-accent-rose/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Critical Risks</span>
            <span className="w-2 h-2 rounded-full bg-accent-rose animate-ping"></span>
          </div>
          <div className="text-3xl font-extrabold text-accent-rose mt-2 font-mono">2</div>
          <p className="text-[11px] text-text-muted mt-1">Requires immediate attention</p>
        </Card>

        <Card className="p-4 bg-surface-2 border-accent-amber/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Warnings</span>
            <AlertTriangle className="w-4 h-4 text-accent-amber" />
          </div>
          <div className="text-3xl font-extrabold text-accent-amber mt-2 font-mono">7</div>
          <p className="text-[11px] text-text-muted mt-1">Variances & contract flags</p>
        </Card>

        <Card className="p-4 bg-surface-2 border-accent-blue/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Insights</span>
            <Sparkles className="w-4 h-4 text-accent-blue" />
          </div>
          <div className="text-3xl font-extrabold text-accent-blue mt-2 font-mono">12</div>
          <p className="text-[11px] text-text-muted mt-1">Optimizations & trends</p>
        </Card>

        <Card className="p-4 bg-surface-2 border-accent-emerald/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Resolved</span>
            <CheckCircle className="w-4 h-4 text-accent-emerald" />
          </div>
          <div className="text-3xl font-extrabold text-accent-emerald mt-2 font-mono">
            {28 + resolvedIds.size}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Cleared in current cycle</p>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-2 border border-border-subtle p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5" /> Severity:
          </span>
          {['All', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedSeverity === sev 
                  ? 'bg-accent-blue text-white shadow-sm' 
                  : 'bg-surface-3 text-text-secondary hover:text-text-main'
              }`}
            >
              {sev === 'All' ? 'All Severities' : sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Category:</span>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-surface-3 text-text-main text-xs border border-border-medium rounded-lg px-2.5 py-1 outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Variance">Salary Variance</option>
            <option value="Compliance">Compliance & Tax</option>
            <option value="Contracts">Contracts</option>
            <option value="Attendance">Attendance</option>
          </select>
        </div>
      </div>

      {/* Intelligence Feed */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card className="p-12 text-center bg-surface-2 border-accent-emerald/20">
            <CheckCircle className="w-12 h-12 text-accent-emerald mx-auto mb-3" />
            <h3 className="text-base font-bold text-text-main">No anomalies detected</h3>
            <p className="text-xs text-text-muted mt-1">All payroll computations and employee records match expected rules for this filter.</p>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item.id}
              className="bg-surface-2 border border-border-subtle hover:border-border-medium rounded-card p-5 shadow-card transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <StatusPill 
                    size="xs" 
                    status={item.severity === 'HIGH' ? 'Critical' : item.severity === 'MEDIUM' ? 'Warning' : 'Info'} 
                  />
                  <span className="text-xs font-semibold text-text-muted px-2 py-0.5 rounded bg-surface-3 border border-border-subtle">
                    {item.type}
                  </span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.detectedAt}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-text-main hover:text-accent-blue transition-colors cursor-pointer" onClick={() => setActiveItem(item)}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Employee: <span className="font-semibold text-text-main">{item.employeeName}</span> ({item.employeeId}) · <span className="text-text-muted">{item.department}</span>
                  </p>
                </div>

                {item.previousPay !== item.currentPay && (
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-text-muted">Previous:</span>
                    <MoneyDisplay amount={item.previousPay} size="sm" />
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-text-muted">Calculated:</span>
                    <MoneyDisplay amount={item.currentPay} size="sm" colored />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleResolve(item.id)}
                  className="hover:text-accent-emerald hover:border-accent-emerald/30"
                >
                  Dismiss
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setActiveItem(item)}
                  icon={ChevronRight}
                >
                  Investigate
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Investigation Drawer */}
      <Drawer
        isOpen={Boolean(activeItem)}
        onClose={() => setActiveItem(null)}
        title="Anomaly Investigation"
        subtitle={`Audit ID: ${activeItem?.id} · Confidence: ${activeItem?.confidence}`}
        badge={activeItem && <StatusPill status={activeItem.severity === 'HIGH' ? 'Critical' : 'Warning'} size="xs" />}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setActiveItem(null)}>
              Close
            </Button>
            <Button variant="success" size="sm" onClick={() => handleResolve(activeItem?.id)}>
              Mark as Verified & Resolved
            </Button>
          </>
        }
      >
        {activeItem && (
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Summary Box */}
            <div className="bg-surface-3 p-4 rounded-xl border border-border-medium space-y-2">
              <div className="font-bold text-base text-text-main">{activeItem.title}</div>
              <div className="text-text-muted text-xs">
                Affecting <span className="font-semibold text-text-main">{activeItem.employeeName}</span> ({activeItem.employeeId}) in {activeItem.department}
              </div>
              {activeItem.previousPay !== activeItem.currentPay && (
                <div className="pt-2 border-t border-border-subtle flex items-center justify-between font-mono">
                  <span>Net Salary Delta:</span>
                  <span className="text-accent-rose font-bold">
                    -₹{(activeItem.previousPay - activeItem.currentPay).toLocaleString()} (-35%)
                  </span>
                </div>
              )}
            </div>

            {/* Potential Causes */}
            <div>
              <h5 className="font-semibold text-text-main mb-2 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-accent-blue" /> Likely Factors Detected
              </h5>
              <ul className="space-y-2">
                {activeItem.likelyFactors.map((fac, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-surface-1 p-2.5 rounded-lg border border-border-subtle text-xs text-text-secondary">
                    <span className="text-accent-blue font-bold">•</span>
                    <span>{fac}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evidence details */}
            <div>
              <h5 className="font-semibold text-text-main mb-2 uppercase tracking-wider text-xs">
                Detection Evidence
              </h5>
              <p className="bg-surface-1 p-3 rounded-lg border border-border-subtle text-xs text-text-muted leading-relaxed font-mono">
                {activeItem.evidence}
              </p>
            </div>

            {/* Recommended Review */}
            <div className="bg-accent-blue/10 border border-accent-blue/20 p-4 rounded-xl space-y-1">
              <h5 className="font-bold text-accent-blue text-xs uppercase tracking-wider">
                Recommended Action for Payroll Manager
              </h5>
              <p className="text-xs text-text-main/90 leading-relaxed">
                {activeItem.recommendation}
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
