import React, { useState } from 'react';
import { RuleSidePanel } from './RuleSidePanel';
import { ArrowRight, Layers, Cpu } from 'lucide-react';

export const SalaryRuleGraph = ({ structureId, rules = [], onNodeClick }) => {
  const [selectedNode, setSelectedNode] = useState(null);

  const categories = ['BASIC', 'ALLOWANCE', 'GROSS', 'DEDUCTION', 'NET'];
  
  const handleNodeClick = (rule) => {
    setSelectedNode(rule);
    if (onNodeClick) {
      onNodeClick(rule);
    }
  };

  const getNodeColor = (category) => {
    switch(category) {
      case 'BASIC': return 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue hover:border-accent-blue';
      case 'ALLOWANCE': return 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan hover:border-accent-cyan';
      case 'GROSS': return 'border-accent-purple/40 bg-accent-purple/10 text-accent-purple hover:border-accent-purple';
      case 'DEDUCTION': return 'border-accent-rose/40 bg-accent-rose/10 text-accent-rose hover:border-accent-rose';
      case 'NET': return 'border-accent-emerald/40 bg-accent-emerald/10 text-accent-emerald hover:border-accent-emerald';
      default: return 'border-border-subtle bg-surface-3 text-text-muted';
    }
  };

  return (
    <div className="flex h-full w-full min-h-[520px]">
      {/* Left panel: Execution Order */}
      <div className="w-64 border-r border-border-subtle bg-surface-1 p-4 overflow-y-auto shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-4 h-4 text-accent-blue" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Execution Order
          </h3>
        </div>

        <div className="space-y-1.5">
          {rules?.map((rule, idx) => (
            <div 
              key={rule.id || idx} 
              onClick={() => handleNodeClick(rule)}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-3 cursor-pointer text-xs transition-colors group"
            >
              <span className="text-text-muted font-mono w-5 font-semibold">{idx + 1}.</span>
              <span className="font-mono font-bold text-text-main group-hover:text-accent-blue transition-colors">
                {rule.code}
              </span>
              <span className="text-[10px] text-text-muted truncate ml-auto">
                {rule.category}
              </span>
            </div>
          ))}
          {!rules?.length && (
            <div className="text-text-muted text-xs italic py-4">No rules available</div>
          )}
        </div>
      </div>

      {/* Right panel: Flow Canvas */}
      <div className="flex-1 relative bg-surface-2/70 overflow-x-auto p-8 flex gap-8 lg:gap-12 items-start justify-center">
        {categories.map((cat) => {
          const categoryRules = rules?.filter(r => r.category === cat) || [];
          return (
            <div key={cat} className="flex flex-col gap-4 items-center w-44 shrink-0 relative z-10">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted px-2.5 py-1 rounded bg-surface-1 border border-border-subtle">
                {cat}
              </div>

              {categoryRules.map((rule) => (
                <div 
                  key={rule.id}
                  onClick={() => handleNodeClick(rule)}
                  className={`w-full p-3.5 rounded-xl border shadow-card cursor-pointer transition-all duration-150 hover:-translate-y-1 ${getNodeColor(rule.category)}`}
                >
                  <div className="font-mono font-bold text-sm mb-1">{rule.code}</div>
                  <div className="text-xs text-text-main font-medium truncate">{rule.name}</div>
                  <div className="text-[10px] font-mono uppercase mt-2 opacity-70 bg-surface-1/50 px-1.5 py-0.5 rounded w-fit">
                    {rule.computationType || 'Formula'}
                  </div>
                </div>
              ))}

              {categoryRules.length === 0 && (
                <div className="w-full p-4 rounded-xl border border-dashed border-border-subtle text-center text-text-muted text-[11px] italic">
                  None
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Slide-in Side Panel */}
      {selectedNode && (
        <RuleSidePanel rule={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
};

export default SalaryRuleGraph;
