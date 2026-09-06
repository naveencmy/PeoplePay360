import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, LayoutGrid, Network, AlertCircle, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import { useSalaryRules, useValidateGraph, useSalaryStructure, useSalaryStructures } from '@/hooks/useSalary';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { SalaryRuleFormModal } from '@/components/salary/SalaryRuleFormModal';
import { SalaryRuleGraph } from '@/components/salary/SalaryRuleGraph';
import EmptyState from '@/components/ui/EmptyState';
import useAuthStore from '@/store/authStore';

export const SalaryRulesPage = () => {
  const { structureId } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState('table'); // 'table' | 'graph'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  const { data: rules = [], isLoading } = useSalaryRules(structureId);
  const { data: graphValidation } = useValidateGraph(structureId);
  const { data: structure } = useSalaryStructure(structureId);
  const { data: structures = [] } = useSalaryStructures();

  const structureList = Array.isArray(structures) ? structures : (structures?.data || []);
  const currentStructure = structure || structureList.find(s => s.id === structureId);
  const structureName = currentStructure?.name || 'Salary Structure';

  const hasCircularDependency = graphValidation?.hasCycle;

  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'BASIC': return 'bg-accent-blue/15 text-accent-blue border-accent-blue/30';
      case 'ALLOWANCE': return 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30';
      case 'GROSS': return 'bg-accent-purple/15 text-accent-purple border-accent-purple/30';
      case 'DEDUCTION': return 'bg-accent-rose/15 text-accent-rose border-accent-rose/30';
      case 'NET': return 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30';
      default: return 'bg-surface-3 text-text-muted border-border-subtle';
    }
  };

  const user = useAuthStore(s => s.user);
  const role = (user?.role || '').toUpperCase();
  const canManage = role === 'ADMIN' || role === 'HR';

  return (
    <div className="space-y-6 pb-12 animate-fade-in flex flex-col h-full">
      <PageHeader 
        title={structureName} 
        subtitle="Ordered execution rules, algebraic component formulas, and dependency graph"
        breadcrumbs={[
          { label: 'Payroll', to: '/payruns' },
          { label: 'Salary Structures', to: '/salary-structures' },
          { label: structureName }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/salary-structures')}
              className="gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Structures</span>
            </Button>

            {/* View Switcher */}
            <div className="flex bg-surface-2 border border-border-subtle rounded-lg p-0.5">
              <button
                onClick={() => setView('table')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                  view === 'table' ? 'bg-surface-1 text-accent-blue shadow-sm' : 'text-text-muted hover:text-text-main'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setView('graph')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                  view === 'graph' ? 'bg-surface-1 text-accent-blue shadow-sm' : 'text-text-muted hover:text-text-main'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Dependency Graph</span>
              </button>
            </div>

            {canManage && (
              <Button 
                onClick={() => { setSelectedRule(null); setIsModalOpen(true); }} 
                variant="primary" 
                size="sm"
                className="gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Rule</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Circular Dependency Warning */}
      {hasCircularDependency && (
        <div className="bg-accent-rose/10 border border-accent-rose/30 rounded-xl p-4 flex items-start gap-3.5 text-accent-rose">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider">Circular Formula Dependency Detected</h3>
            <p className="text-xs opacity-90 mt-0.5">
              One or more formulas reference themselves indirectly. You must decouple cyclic parameters before running payroll.
            </p>
          </div>
        </div>
      )}

      {/* Main Rules Container */}
      <div className="flex-1 bg-surface-2 rounded-2xl border border-border-subtle overflow-hidden shadow-card min-h-[460px]">
        {isLoading ? (
          <div className="p-16 text-center text-text-muted flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
            <span className="text-xs">Loading computation rules...</span>
          </div>
        ) : !rules?.length ? (
          <EmptyState 
            icon={Sparkles}
            title="No rules configured"
            description="Add calculation rules (Basic, HRA, PF, Tax, Net) to build your salary formula."
            actionLabel={canManage ? "Add First Rule" : undefined}
            onAction={canManage ? () => { setSelectedRule(null); setIsModalOpen(true); } : undefined}
          />
        ) : view === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-1 text-text-muted font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">Seq</th>
                  <th className="py-3 px-4">Rule Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Computation Type</th>
                  <th className="py-3 px-4">Formula / Expression</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {rules.map((rule, idx) => (
                  <tr key={rule.id || idx} className="hover:bg-surface-3/50 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-text-muted font-semibold">
                      {rule.sequence || idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-text-main">
                      {rule.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-3 border border-border-subtle text-accent-blue font-bold">
                        {rule.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${getCategoryColor(rule.category)}`}>
                        {rule.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary capitalize">
                      {rule.computationType || 'Formula'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-text-main max-w-xs truncate">
                      <span className="bg-surface-1 px-2 py-1 rounded border border-border-subtle text-accent-cyan">
                        {rule.formula || rule.amount || `${rule.percentage || 40}% of ${rule.percentageOf || 'BASIC'}`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {canManage ? (
                        <button 
                          className="text-xs text-accent-blue font-semibold hover:underline"
                          onClick={() => handleEdit(rule)}
                        >
                          Edit Rule
                        </button>
                      ) : (
                        <span className="text-text-muted font-mono text-[11px]">Read-only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <SalaryRuleGraph structureId={structureId} rules={rules} onNodeClick={canManage ? handleEdit : undefined} />
        )}
      </div>

      {isModalOpen && (
        <SalaryRuleFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          rule={selectedRule}
          structureId={structureId}
        />
      )}
    </div>
  );
};

export default SalaryRulesPage;
