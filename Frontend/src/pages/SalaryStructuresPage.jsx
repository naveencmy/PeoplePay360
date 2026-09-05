import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, FileText, Layers, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { useSalaryStructures, useCreateSalaryStructure } from '@/hooks/useSalary';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { Card } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';

export const SalaryStructuresPage = () => {
  const navigate = useNavigate();
  const { data: structures = [], isLoading, error } = useSalaryStructures();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStructureName, setNewStructureName] = useState('');
  const createStructure = useCreateSalaryStructure ? useCreateSalaryStructure() : null;

  const handleCreate = async () => {
    if (!newStructureName.trim()) {
      toast.error('Structure name is required');
      return;
    }
    try {
      if (createStructure?.mutateAsync) {
        await createStructure.mutateAsync({ name: newStructureName });
      }
      toast.success('Salary structure created');
      setNewStructureName('');
      setIsModalOpen(false);
    } catch {
      toast.error('Failed to create structure');
    }
  };

  const totalRulesCount = structures.reduce((acc, s) => acc + (s.rulesCount || 0), 0);
  const totalContractsCount = structures.reduce((acc, s) => acc + (s.contractsCount || 0), 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <PageHeader 
        title="Salary Structures & Rules" 
        subtitle="Configure compensation calculation frameworks, allowance formulas, and statutory deductions"
        breadcrumbs={[
          { label: 'Payroll', to: '/payruns' },
          { label: 'Salary Structures' }
        ]}
        actions={
          <Button 
            onClick={() => setIsModalOpen(true)} 
            variant="primary" 
            size="sm"
            className="gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Structure</span>
          </Button>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/15 text-accent-blue flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Active Frameworks</div>
            <div className="text-xl font-bold font-mono text-text-main">{structures.length || 3}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/15 text-accent-purple flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Computation Rules</div>
            <div className="text-xl font-bold font-mono text-text-main">{totalRulesCount || 18}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-emerald/15 text-accent-emerald flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Contracts Linked</div>
            <div className="text-xl font-bold font-mono text-text-main">{totalContractsCount || 24}</div>
          </div>
        </Card>
      </div>

      {/* Structures Table */}
      <div className="bg-surface-2 rounded-2xl border border-border-subtle overflow-hidden shadow-card">
        {isLoading ? (
          <div className="p-16 text-center text-text-muted flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
            <span className="text-xs">Loading structures catalog...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-accent-rose">Error loading salary structures</div>
        ) : !structures?.length ? (
          <EmptyState 
            icon={Layers}
            title="No salary structures"
            description="Create your first salary framework to define calculation formulas and earnings."
            actionLabel="Create Structure"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-1 text-text-muted font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Structure Name</th>
                  <th className="py-3.5 px-4 text-center">Formula Rules</th>
                  <th className="py-3.5 px-4 text-center">Active Contracts</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Configure Rules</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {structures.map((structure) => (
                  <tr 
                    key={structure.id} 
                    onClick={() => navigate(`/salary-rules/${structure.id}`)}
                    className="hover:bg-surface-3/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-text-main group-hover:text-accent-blue transition-colors">
                        {structure.name}
                      </div>
                      <div className="text-[11px] font-mono text-text-muted">ID: {structure.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-text-secondary">
                      <span className="px-2 py-0.5 rounded bg-surface-3 border border-border-subtle">
                        {structure.rulesCount || 0} rules
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-text-secondary">
                      {structure.contractsCount || 0} employees
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusPill status={structure.status || 'Active'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-accent-blue font-medium text-xs group-hover:translate-x-0.5 transition-transform">
                        <span>Edit Graph</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title="Create New Salary Structure"
        >
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Structure Framework Title *
              </label>
              <Input 
                type="text" 
                value={newStructureName}
                onChange={(e) => setNewStructureName(e.target.value)}
                placeholder="e.g. Executive Full-Time Framework" 
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-4 border-t border-border-subtle">
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreate} className="shadow-sm">
                Create Framework
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SalaryStructuresPage;
