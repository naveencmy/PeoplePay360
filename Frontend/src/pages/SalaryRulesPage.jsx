import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, LayoutGrid, Network, AlertCircle } from 'lucide-react';
import { useSalaryRules, useValidateGraph } from '@/hooks/useSalary';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { SalaryRuleFormModal } from '@/components/salary/SalaryRuleFormModal';
import { SalaryRuleGraph } from '@/components/salary/SalaryRuleGraph';

export const SalaryRulesPage = () => {
  const { structureId } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState('table'); // 'table' | 'graph'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  const { data: rules, isLoading } = useSalaryRules(structureId);
  const { data: graphValidation } = useValidateGraph(structureId);

  const hasCircularDependency = graphValidation?.hasCycle;

  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'BASIC': return 'bg-blue-500/20 text-blue-400';
      case 'ALLOWANCE': return 'bg-teal-500/20 text-teal-400';
      case 'GROSS': return 'bg-purple-500/20 text-purple-400';
      case 'DEDUCTION': return 'bg-red-500/20 text-red-400';
      case 'NET': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6 flex flex-col h-full">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/salary-structures')}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <PageHeader 
            title={`Salary Rules - ${rules?.[0]?.structureName || 'Loading...'}`} 
            subtitle="Configure computation rules and formulas for this structure"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-[#0B0D10] border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm font-medium transition-colors ${view === 'table' ? 'bg-[#161B22] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              Table
            </button>
            <button
              onClick={() => setView('graph')}
              className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm font-medium transition-colors ${view === 'graph' ? 'bg-[#161B22] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <Network className="w-4 h-4" />
              Graph
            </button>
          </div>
          <Button onClick={() => { setSelectedRule(null); setIsModalOpen(true); }} className="bg-[#4F7CFF] hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Button>
        </div>
      </div>

      {hasCircularDependency && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-medium">Circular dependency detected</h3>
            <p className="text-red-400/80 text-sm mt-1">Resolve cyclic references in your formulas before using this structure in a payrun.</p>
          </div>
        </div>
      )}

      <div className="flex-1 bg-[#161B22] rounded-lg border border-white/10 overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading rules...</div>
        ) : view === 'table' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm">
                <th className="p-4 font-medium">Sequence</th>
                <th className="p-4 font-medium">Rule Name</th>
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Computation Type</th>
                <th className="p-4 font-medium">Formula/Amount</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules?.map((rule) => (
                <tr key={rule.id} className="border-b border-white/10 hover:bg-white/5 transition-colors text-gray-200">
                  <td className="p-4 text-gray-500">{rule.sequence}</td>
                  <td className="p-4 font-medium text-white">{rule.name}</td>
                  <td className="p-4 font-mono text-sm">{rule.code}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(rule.category)}`}>
                      {rule.category}
                    </span>
                  </td>
                  <td className="p-4">{rule.computationType}</td>
                  <td className="p-4 font-mono text-sm text-gray-400 truncate max-w-[200px]">
                    {rule.formula || rule.amount || `${rule.percentage}% of ${rule.percentageOf}`}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      className="text-[#4F7CFF] hover:text-blue-400 text-sm font-medium mr-3"
                      onClick={() => handleEdit(rule)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <SalaryRuleGraph structureId={structureId} rules={rules} onNodeClick={handleEdit} />
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
