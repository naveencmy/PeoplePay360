import React, { useState, useMemo } from 'react';
import { 
  BrainCircuit, AlertTriangle, ShieldCheck, Sparkles, CheckCircle, 
  ArrowRight, Filter, Info, Eye, Clock, User, FileText, ChevronRight, RefreshCw
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusPill from '@/components/ui/StatusPill';
import Drawer from '@/components/ui/Drawer';
import MoneyDisplay from '@/components/ui/MoneyDisplay';
import { useEmployees } from '@/hooks/useEmployees';
import { useContracts } from '@/hooks/useContracts';
import { usePayruns } from '@/hooks/usePayrun';
import { useSalaryStructures } from '@/hooks/useSalary';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/realApi';

export default function PayrollIntelligencePage() {
  const queryClient = useQueryClient();
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeItem, setActiveItem] = useState(null);
  const [resolvedIds, setResolvedIds] = useState(new Set());
  const [isScanning, setIsScanning] = useState(false);

  // 1. Live Employees
  const { data: employees = [], isLoading: loadingEmployees } = useEmployees();

  // 2. Live Contracts & Expiring Contracts
  const { data: contracts = [], isLoading: loadingContracts } = useContracts();
  const { data: expiringContracts = [] } = useQuery({
    queryKey: ['expiringContracts'],
    queryFn: () => api.getExpiringContracts(60),
  });

  // 3. Live Salary Structures
  const { data: structures = [] } = useSalaryStructures();

  // 4. Live Payruns
  const { data: payruns = [] } = usePayruns();

  // 5. Live Attendance Anomalies
  const { data: attendanceAnomalies = [] } = useQuery({
    queryKey: ['attendanceAnomalies'],
    queryFn: () => api.getAttendanceAnomalies(),
  });

  // Dynamically compute real intelligence items from live database queries
  const liveIntelligenceItems = useMemo(() => {
    const items = [];

    // Audit 1: Expiring contracts
    if (Array.isArray(expiringContracts)) {
      expiringContracts.forEach((c, idx) => {
        items.push({
          id: `INT-CON-${c.id?.slice(0, 6) || idx}`,
          severity: 'HIGH',
          type: 'Contracts',
          title: `Contract Expiring Soon: ${c.name || 'Employment Contract'}`,
          employeeName: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.employeeName || 'Active Employee',
          employeeId: c.employee_code || c.employee_id || 'EMP-LIVE',
          department: c.department || 'Operations',
          previousPay: parseFloat(c.wage) || 0,
          currentPay: parseFloat(c.wage) || 0,
          confidence: '99%',
          detectedAt: 'Live Audit',
          likelyFactors: [
            `Contract validity ends on ${c.date_end ? new Date(c.date_end).toLocaleDateString() : 'near-term'}`,
            'No succeeding contract renewal recorded in PostgreSQL master ledger'
          ],
          evidence: `Contract record [${c.name}] has expiration date set without an active replacement contract.`,
          recommendation: 'Draft replacement contract or extend end date before next monthly payrun execution.',
          status: 'Action Required'
        });
      });
    }

    // Audit 2: Employee statutory profile compliance
    if (Array.isArray(employees)) {
      employees.forEach((emp) => {
        // Missing PAN Number
        if (!emp.pan_number || emp.pan_number === 'PENDING') {
          items.push({
            id: `INT-PAN-${emp.id?.slice(0, 6)}`,
            severity: 'MEDIUM',
            type: 'Compliance',
            title: `Missing PAN Number for Statutory Tax Filing`,
            employeeName: emp.name,
            employeeId: emp.employee_code || emp.id?.slice(0, 8),
            department: emp.department || 'Operations',
            previousPay: 0,
            currentPay: 0,
            confidence: '100%',
            detectedAt: 'Live Audit',
            likelyFactors: [
              'Employee master profile created without permanent account number (PAN)',
              'Statutory Form 16 and TDS filing requires valid 10-character PAN'
            ],
            evidence: `Employee master record ${emp.employee_code} has empty pan_number column in PostgreSQL database.`,
            recommendation: 'Collect official PAN card copy from employee and update profile for tax deduction compliance.',
            status: 'Pending Review'
          });
        }

        // Missing Bank Details
        if (!emp.bank_account_number || !emp.bank_ifsc) {
          items.push({
            id: `INT-BNK-${emp.id?.slice(0, 6)}`,
            severity: 'HIGH',
            type: 'Compliance',
            title: `Missing Banking Coordinates for Direct Salary Deposit`,
            employeeName: emp.name,
            employeeId: emp.employee_code || emp.id?.slice(0, 8),
            department: emp.department || 'Operations',
            previousPay: 0,
            currentPay: 0,
            confidence: '100%',
            detectedAt: 'Live Audit',
            likelyFactors: [
              'Missing bank account number or IFSC code',
              'Automated NACH / NEFT batch export will fail for this beneficiary'
            ],
            evidence: `Bank account or IFSC column is null for employee record in database.`,
            recommendation: 'Collect cancelled cheque or bank statement and record valid IFSC before executing payrun.',
            status: 'Critical Alert'
          });
        }
      });
    }

    // Audit 3: Attendance anomalies from database
    if (Array.isArray(attendanceAnomalies)) {
      attendanceAnomalies.forEach((a) => {
        items.push({
          id: `INT-ATT-${a.id?.slice(0, 6)}`,
          severity: 'MEDIUM',
          type: 'Attendance',
          title: `High Unplanned Absence Ratio Detected (${a.attendance_pct}% attendance)`,
          employeeName: `${a.first_name || ''} ${a.last_name || ''}`.trim() || 'Employee',
          employeeId: a.id?.slice(0, 8),
          department: a.department || 'General',
          previousPay: 0,
          currentPay: 0,
          confidence: '94%',
          detectedAt: 'Live Audit',
          likelyFactors: [
            `Employee logged only ${a.present_days} present days out of ${a.total_days} scheduled working days`,
            'Attendance percentage fell below 50% statutory threshold'
          ],
          evidence: `Attendance query confirmed ${a.present_days} days present out of ${a.total_days} standard working calendar days.`,
          recommendation: 'Confirm with department lead whether medical leave or unrecorded off-site duties explain the absence gap.',
          status: 'Pending Review'
        });
      });
    }

    // Audit 4: Salary structure completeness check
    if (Array.isArray(structures)) {
      structures.forEach((st) => {
        if (!st.rulesCount && (!st.rules || st.rules.length === 0)) {
          items.push({
            id: `INT-STR-${st.id?.slice(0, 6)}`,
            severity: 'HIGH',
            type: 'Compliance',
            title: `Unconfigured Salary Structure: ${st.name}`,
            employeeName: 'Structure Policy',
            employeeId: st.id?.slice(0, 8),
            department: 'Compensation & Benefits',
            previousPay: 0,
            currentPay: 0,
            confidence: '100%',
            detectedAt: 'Live Audit',
            likelyFactors: [
              'Salary structure has 0 active computation rules attached',
              'Assigned contracts cannot resolve gross/net salary formulas'
            ],
            evidence: `Database table salary_rules has zero entries for structure_id [${st.id}].`,
            recommendation: 'Configure Basic Pay, Allowance, and Deductions rules before assigning to employee contracts.',
            status: 'Critical Alert'
          });
        }
      });
    }

    // Audit 5: Payrun lifecycle checks
    if (Array.isArray(payruns)) {
      payruns.forEach((p) => {
        if (p.state === 'DRAFT') {
          items.push({
            id: `INT-PAY-${p.id?.slice(0, 6)}`,
            severity: 'LOW',
            type: 'Variance',
            title: `Pending Draft Payrun Requires Computation: ${p.name}`,
            employeeName: 'Payrun Cycle',
            employeeId: p.id?.slice(0, 8),
            department: p.department || 'All Departments',
            previousPay: 0,
            currentPay: 0,
            confidence: '95%',
            detectedAt: 'Live Audit',
            likelyFactors: [
              `Payrun period ${p.period_start} to ${p.period_end} is in DRAFT state`,
              'Payslips have not yet been locked and verified for disbursement'
            ],
            evidence: `Payrun state is currently DRAFT with validated_at = NULL.`,
            recommendation: 'Trigger batch calculation to compile employee payslips and review variance ledger.',
            status: 'Informational'
          });
        }
      });
    }

    return items;
  }, [expiringContracts, employees, attendanceAnomalies, structures, payruns]);

  const handleResolve = (id) => {
    setResolvedIds(prev => new Set([...prev, id]));
    setActiveItem(null);
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['employees'] }),
      queryClient.invalidateQueries({ queryKey: ['contracts'] }),
      queryClient.invalidateQueries({ queryKey: ['expiringContracts'] }),
      queryClient.invalidateQueries({ queryKey: ['attendanceAnomalies'] }),
      queryClient.invalidateQueries({ queryKey: ['salaryStructures'] }),
      queryClient.invalidateQueries({ queryKey: ['payruns'] }),
    ]);
    setTimeout(() => {
      setIsScanning(false);
    }, 600);
  };

  const filteredItems = liveIntelligenceItems.filter(item => {
    if (resolvedIds.has(item.id)) return false;
    if (selectedSeverity !== 'All' && item.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'All' && item.type !== selectedCategory) return false;
    return true;
  });

  const criticalCount = liveIntelligenceItems.filter(i => !resolvedIds.has(i.id) && i.severity === 'HIGH').length;
  const warningCount = liveIntelligenceItems.filter(i => !resolvedIds.has(i.id) && i.severity === 'MEDIUM').length;
  const insightCount = liveIntelligenceItems.filter(i => !resolvedIds.has(i.id) && i.severity === 'LOW').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        breadcrumbs={[
          { label: 'Payroll', to: '/payruns' },
          { label: 'Intelligence' }
        ]}
        title="Payroll Intelligence Center"
        subtitle="Autonomous anomaly detection and statistical variance engine. Flags potential risks before salary disbursement."
        badge={<span className="badge-pill bg-accent-purple/15 text-accent-purple border-accent-purple/30">Live Database Audits Active</span>}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="primary" 
              size="sm" 
              icon={isScanning ? RefreshCw : Sparkles}
              disabled={isScanning}
              onClick={handleRunScan}
              className="gap-2 shadow-sm"
            >
              <span className={isScanning ? 'animate-spin' : ''}>
                {isScanning ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </span>
              <span>{isScanning ? 'Scanning PostgreSQL...' : 'Run Intelligence Scan'}</span>
            </Button>
          </div>
        }
      />

      {/* Overview Stat Counters (100% Live Database Numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface-2 border-accent-rose/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Critical Risks</span>
            {criticalCount > 0 && <span className="w-2 h-2 rounded-full bg-accent-rose animate-ping"></span>}
          </div>
          <div className="text-3xl font-extrabold text-accent-rose mt-2 font-mono">{criticalCount}</div>
          <p className="text-[11px] text-text-muted mt-1">Requires immediate attention</p>
        </Card>

        <Card className="p-4 bg-surface-2 border-accent-amber/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Warnings</span>
            <AlertTriangle className="w-4 h-4 text-accent-amber" />
          </div>
          <div className="text-3xl font-extrabold text-accent-amber mt-2 font-mono">{warningCount}</div>
          <p className="text-[11px] text-text-muted mt-1">Variances & compliance flags</p>
        </Card>

        <Card className="p-4 bg-surface-2 border-accent-blue/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Insights</span>
            <Sparkles className="w-4 h-4 text-accent-blue" />
          </div>
          <div className="text-3xl font-extrabold text-accent-blue mt-2 font-mono">{insightCount}</div>
          <p className="text-[11px] text-text-muted mt-1">Pipeline & lifecycle alerts</p>
        </Card>

        <Card className="p-4 bg-surface-2 border-accent-emerald/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Resolved</span>
            <CheckCircle className="w-4 h-4 text-accent-emerald" />
          </div>
          <div className="text-3xl font-extrabold text-accent-emerald mt-2 font-mono">
            {resolvedIds.size}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Cleared in current session</p>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-2 border border-border-subtle p-3 rounded-xl shadow-card">
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
        {loadingEmployees || loadingContracts ? (
          <Card className="p-12 text-center bg-surface-2">
            <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-main">Scanning Live Records...</h3>
            <p className="text-xs text-text-muted mt-1">Running automated compliance audits across PostgreSQL tables.</p>
          </Card>
        ) : filteredItems.length === 0 ? (
          <Card className="p-12 text-center bg-surface-2 border-accent-emerald/20">
            <CheckCircle className="w-12 h-12 text-accent-emerald mx-auto mb-3" />
            <h3 className="text-base font-bold text-text-main">No anomalies detected</h3>
            <p className="text-xs text-text-muted mt-1">All employee records, statutory codes, and contract parameters match verified standards.</p>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item.id}
              className="bg-surface-2 border border-border-subtle hover:border-border-medium rounded-xl p-5 shadow-card transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-5"
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
                  <h4 
                    className="text-base font-bold text-text-main hover:text-accent-blue transition-colors cursor-pointer" 
                    onClick={() => setActiveItem(item)}
                  >
                    {item.title}
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Target: <span className="font-semibold text-text-main">{item.employeeName}</span> ({item.employeeId}) · <span className="text-text-muted">{item.department}</span>
                  </p>
                </div>

                {item.previousPay > 0 && item.previousPay !== item.currentPay && (
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
        title="Audit Investigation"
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
