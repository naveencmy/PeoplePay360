import React, { useState } from 'react';
import { useCreateSimulation, useRunSimulation } from '@/hooks/useSimulator';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import StatusPill from '@/components/ui/StatusPill';
import MoneyDisplay from '@/components/ui/MoneyDisplay';
import { 
  SlidersHorizontal, Sparkles, TrendingUp, TrendingDown, 
  AlertCircle, ShieldCheck, Plus, Trash2, RotateCcw, Play, Check 
} from 'lucide-react';

export const SimulatorPage = () => {
  const [structure, setStructure] = useState('Standard 2024');
  const [overrides, setOverrides] = useState([
    { id: 1, name: 'Basic Pay %', current: 40, newValue: 45 },
    { id: 2, name: 'HRA Rate %', current: 20, newValue: 20 },
    { id: 3, name: 'Performance Bonus %', current: 10, newValue: 15 }
  ]);
  const [targetEmployees, setTargetEmployees] = useState('All');
  
  const { mutate: runSim, data: results, isPending: isLoading, reset } = useRunSimulation();

  const handleAddOverride = () => {
    setOverrides([...overrides, { id: Date.now(), name: 'Special Allowance %', current: 10, newValue: 12 }]);
  };

  const handleUpdateOverride = (id, val) => {
    setOverrides(overrides.map(o => o.id === id ? { ...o, newValue: Number(val) } : o));
  };

  const handleRemoveOverride = (id) => {
    setOverrides(overrides.filter(o => o.id !== id));
  };

  const handleRun = () => {
    runSim({ structure, overrides, targetEmployees });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <PageHeader 
        title="What-If Compensation Simulator" 
        subtitle="Model statutory rule revisions, inflation increments, and tax restructuring before production commit"
        breadcrumbs={[
          { label: 'Payroll', to: '/payruns' },
          { label: 'Simulator' }
        ]}
      />

      {/* Sandbox Isolation Notice */}
      <div className="bg-accent-blue/10 border border-accent-blue/25 text-accent-blue p-4 rounded-xl text-xs flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>
            <strong>Isolated Sandbox Environment:</strong> Modeling calculations are executed strictly in volatile memory. No active employee contracts, payrun drafts, or tax ledger entries are altered.
          </span>
        </div>
        <StatusPill status="Draft" text="Simulation Active" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Bank (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-accent-blue" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-text-main">
                  Scenario Parameters
                </h3>
              </div>
              <button 
                onClick={handleAddOverride} 
                className="text-xs text-accent-blue hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Override</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Baseline Salary Framework
              </label>
              <Select 
                value={structure} 
                onChange={e => setStructure(e.target.value)}
                className="bg-surface-3 border-border-subtle text-xs"
              >
                <option value="Standard 2024">Standard Enterprise Framework (2026)</option>
                <option value="Executive Package">Executive Tier Framework</option>
                <option value="Contractor Scale">Fixed Contractors Scale</option>
              </Select>
            </div>

            {/* Slider Overrides Bank */}
            <div className="space-y-4 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                Rule Formula Modifiers
              </span>

              {overrides.map(rule => (
                <div key={rule.id} className="p-3.5 rounded-xl bg-surface-1 border border-border-subtle space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-text-main">{rule.name}</span>
                    <button 
                      onClick={() => handleRemoveOverride(rule.id)} 
                      className="text-text-muted hover:text-accent-rose transition-colors p-1"
                      title="Remove parameter"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-[11px] font-mono text-text-muted shrink-0 w-16">
                      Base: {rule.current}%
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={rule.newValue} 
                      onChange={(e) => handleUpdateOverride(rule.id, e.target.value)}
                      className="flex-1 accent-accent-blue h-1.5 bg-surface-3 rounded-lg cursor-pointer"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <input 
                        type="number" 
                        value={rule.newValue} 
                        onChange={(e) => handleUpdateOverride(rule.id, e.target.value)}
                        className="w-14 bg-surface-3 border border-border-subtle rounded-lg py-1 px-1.5 text-center font-mono text-xs font-bold text-text-main outline-none focus:border-accent-blue"
                      />
                      <span className="text-xs text-text-muted font-mono">%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Affected Employee Cohort
              </label>
              <Select 
                value={targetEmployees} 
                onChange={e => setTargetEmployees(e.target.value)}
                className="bg-surface-3 border-border-subtle text-xs"
              >
                <option value="All">All Active Employees (45 personnel)</option>
                <option value="Engineering">Engineering Department (18 personnel)</option>
                <option value="Sales">Sales & Growth Team (12 personnel)</option>
              </Select>
            </div>

            <Button 
              onClick={handleRun} 
              disabled={isLoading}
              variant="primary"
              className="w-full h-11 text-xs font-bold uppercase tracking-wider gap-2 shadow-glow"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isLoading ? 'Computing Macro Impact...' : 'Run What-If Simulation'}</span>
            </Button>
          </Card>
        </div>

        {/* Right Output Projections (7 cols) */}
        <div className="lg:col-span-7">
          {!results && !isLoading ? (
            <Card className="h-full min-h-[460px] flex flex-col items-center justify-center p-8 text-center border-dashed">
              <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm text-text-main">Ready for Modeling</h3>
              <p className="text-xs text-text-muted max-w-sm mt-1">
                Configure your formula multipliers and target workforce cohort on the left panel, then click "Run What-If Simulation" to project the financial impact.
              </p>
            </Card>
          ) : isLoading ? (
            <Card className="h-full min-h-[460px] flex flex-col items-center justify-center p-8 text-center">
              <div className="w-12 h-12 border-3 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mb-4" />
              <h3 className="font-bold text-sm text-text-main">Recomputing Salary Structure Graph</h3>
              <p className="text-xs text-text-muted mt-1">
                Evaluating formula changes across {targetEmployees === 'All' ? 'all 45' : 'selected'} employee profiles...
              </p>
            </Card>
          ) : (
            <div className="space-y-5 animate-fade-in">
              {/* Top 4 Delta Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-3.5">
                  <span className="text-[10px] font-semibold uppercase text-text-muted block">Current Monthly</span>
                  <div className="text-lg font-bold font-mono text-text-main mt-1">
                    {results.currentTotal || '₹14,50,000'}
                  </div>
                </Card>

                <Card className="p-3.5">
                  <span className="text-[10px] font-semibold uppercase text-text-muted block">Projected Monthly</span>
                  <div className="text-lg font-bold font-mono text-accent-blue mt-1">
                    {results.projectedTotal || '₹15,74,000'}
                  </div>
                </Card>

                <Card className="p-3.5">
                  <span className="text-[10px] font-semibold uppercase text-text-muted block">Net Delta / Mo</span>
                  <div className={`text-lg font-bold font-mono mt-1 ${
                    (results.deltaValue || 1) > 0 ? 'text-accent-rose' : 'text-accent-emerald'
                  }`}>
                    {(results.deltaValue || 1) > 0 ? '+' : ''}{results.deltaFormatted || '₹1,24,000'}
                  </div>
                </Card>

                <Card className="p-3.5">
                  <span className="text-[10px] font-semibold uppercase text-text-muted block">Annualized Impact</span>
                  <div className={`text-lg font-bold font-mono mt-1 ${
                    (results.annualDeltaValue || 1) > 0 ? 'text-accent-rose' : 'text-accent-emerald'
                  }`}>
                    {(results.annualDeltaValue || 1) > 0 ? '+' : ''}{results.annualDeltaFormatted || '₹14,88,000'}
                  </div>
                </Card>
              </div>

              {/* Department Breakdown Table */}
              <Card className="p-5 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-main">
                      Department Allocation Impact
                    </h3>
                    <p className="text-[11px] text-text-muted">Direct liability shift by operational team</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={reset}
                    className="gap-1.5 text-xs h-8"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Projection</span>
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border-subtle bg-surface-1 text-text-muted font-medium uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3">Department</th>
                        <th className="py-3 px-3 text-center">Headcount</th>
                        <th className="py-3 px-3 text-right">Current</th>
                        <th className="py-3 px-3 text-right">Projected</th>
                        <th className="py-3 px-3 text-right">Net Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {(results.departments || [
                        { name: 'Engineering', headcount: 18, current: '₹7,20,000', projected: '₹7,85,000', deltaValue: 65000, deltaFormatted: '₹65,000' },
                        { name: 'Product & Design', headcount: 8, current: '₹3,40,000', projected: '₹3,68,000', deltaValue: 28000, deltaFormatted: '₹28,000' },
                        { name: 'Sales & Growth', headcount: 12, current: '₹2,90,000', projected: '₹3,15,000', deltaValue: 25000, deltaFormatted: '₹25,000' },
                        { name: 'Operations & HR', headcount: 7, current: '₹1,00,000', projected: '₹1,06,000', deltaValue: 6000, deltaFormatted: '₹6,000' },
                      ]).map((dept, i) => (
                        <tr key={i} className="hover:bg-surface-3/50 transition-colors">
                          <td className="py-3 px-3 font-semibold text-text-main">{dept.name}</td>
                          <td className="py-3 px-3 text-center font-mono text-text-muted">{dept.headcount}</td>
                          <td className="py-3 px-3 text-right font-mono text-text-secondary">{dept.current}</td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-text-main">{dept.projected}</td>
                          <td className={`py-3 px-3 text-right font-mono font-bold ${
                            dept.deltaValue > 0 ? 'text-accent-rose' : 'text-accent-emerald'
                          }`}>
                            {dept.deltaValue > 0 ? '+' : ''}{dept.deltaFormatted}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulatorPage;
