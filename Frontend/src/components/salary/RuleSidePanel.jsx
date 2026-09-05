import React from 'react';
import { X, Edit2, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const RuleSidePanel = ({ rule, onClose }) => {
  if (!rule) return null;

  return (
    <div className="w-80 bg-[#161B22] border-l border-white/10 flex flex-col h-full shadow-2xl animate-in slide-in-from-right">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="font-medium text-white truncate pr-4">{rule.name}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 uppercase">Code</span>
          </div>
          <div className="font-mono text-lg font-semibold text-white">{rule.code}</div>
          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/5 border border-white/10 text-gray-300">
            {rule.category}
          </div>
        </div>

        <div className="bg-[#0B0D10] rounded-lg p-3 border border-white/5">
          <div className="text-xs text-gray-500 mb-2 uppercase flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Computation
          </div>
          <div className="text-sm font-medium text-gray-200">
            Type: <span className="text-white">{rule.computationType}</span>
          </div>
          <div className="mt-2 font-mono text-xs text-[#4F7CFF] bg-[#4F7CFF]/10 p-2 rounded">
            {rule.formula || rule.amount || `${rule.percentage}% of ${rule.percentageOf}`}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Dependencies (Needs)</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded text-sm">
              <span className="font-mono text-gray-300">BASIC</span>
              <span className="text-xs text-gray-500">Value</span>
            </div>
            <div className="text-xs text-gray-500 italic">No other dependencies</div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Used By (Dependents)</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded text-sm">
              <span className="font-mono text-gray-300">GROSS</span>
              <span className="text-xs text-gray-500">Formula</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded text-sm">
              <span className="font-mono text-gray-300">PF</span>
              <span className="text-xs text-gray-500">Percentage</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/10">
        <Button className="w-full bg-[#4F7CFF] hover:bg-blue-600 flex items-center justify-center gap-2">
          <Edit2 className="w-4 h-4" />
          Edit Rule
        </Button>
      </div>
    </div>
  );
};
