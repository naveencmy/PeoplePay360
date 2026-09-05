import React, { useState } from 'react';
import { RuleSidePanel } from './RuleSidePanel';

export const SalaryRuleGraph = ({ structureId, rules, onNodeClick }) => {
  const [selectedNode, setSelectedNode] = useState(null);

  // MVP Mock visualization
  const categories = ['BASIC', 'ALLOWANCE', 'GROSS', 'DEDUCTION', 'NET'];
  
  const handleNodeClick = (rule) => {
    setSelectedNode(rule);
    if (onNodeClick) {
      onNodeClick(rule);
    }
  };

  const getNodeColor = (category) => {
    switch(category) {
      case 'BASIC': return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
      case 'ALLOWANCE': return 'border-teal-500/50 bg-teal-500/10 text-teal-400';
      case 'GROSS': return 'border-purple-500/50 bg-purple-500/10 text-purple-400';
      case 'DEDUCTION': return 'border-red-500/50 bg-red-500/10 text-red-400';
      case 'NET': return 'border-green-500/50 bg-green-500/10 text-green-400';
      default: return 'border-gray-500/50 bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="flex h-full w-full min-h-[500px]">
      {/* Left panel: Execution Order */}
      <div className="w-64 border-r border-white/10 bg-[#0B0D10] p-4 overflow-y-auto">
        <h3 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">Execution Order</h3>
        <div className="space-y-2">
          {rules?.map((rule, idx) => (
            <div key={rule.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer text-sm">
              <span className="text-gray-500 font-mono w-4">{idx + 1}.</span>
              <span className="text-gray-300 truncate">{rule.code}</span>
            </div>
          ))}
          {!rules?.length && (
            <div className="text-gray-500 text-sm">No rules available</div>
          )}
        </div>
      </div>

      {/* Right panel: Graph Canvas */}
      <div className="flex-1 relative bg-[#161B22] overflow-hidden p-8 flex gap-12 items-start justify-center">
        {categories.map((cat, colIdx) => (
          <div key={cat} className="flex flex-col gap-6 items-center w-40 relative z-10">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">{cat}</h4>
            {rules?.filter(r => r.category === cat).map((rule, idx) => (
              <div 
                key={rule.id}
                onClick={() => handleNodeClick(rule)}
                className={`w-full p-3 rounded-lg border cursor-pointer hover:shadow-lg transition-all ${getNodeColor(rule.category)}`}
              >
                <div className="font-mono font-bold text-sm mb-1">{rule.code}</div>
                <div className="text-xs text-white/70 truncate">{rule.name}</div>
                <div className="text-[10px] uppercase mt-2 opacity-50">{rule.computationType}</div>
              </div>
            ))}
          </div>
        ))}

        {/* SVG Edges layer (Mocked for MVP) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255,255,255,0.2)" />
            </marker>
          </defs>
          {/* Example static line for visual context */}
          <line x1="250" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.2)" strokeWidth="2" markerEnd="url(#arrowhead)" />
        </svg>
      </div>

      {/* Slide-in Side Panel */}
      {selectedNode && (
        <RuleSidePanel rule={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
};
