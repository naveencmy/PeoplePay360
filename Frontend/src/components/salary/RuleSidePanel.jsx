import React from 'react';
import { X, Edit2, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const RuleSidePanel = ({ rule, onClose, onEdit }) => {
  if (!rule) return null;

  return (
    <div className="w-80 bg-surface-1 dark:bg-[#161B22] border-l border-border-subtle flex flex-col h-full shadow-2xl animate-in slide-in-from-right">
      <div className="flex items-center justify-between p-4 border-b border-border-subtle">
        <h3 className="font-semibold text-text-main truncate pr-4">{rule.name}</h3>
        <button 
          onClick={onClose} 
          className="p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-3 transition-colors"
          aria-label="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-5">
        <div>
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Rule Code</span>
          <div className="font-mono text-lg font-bold text-text-main mt-0.5">{rule.code}</div>
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-surface-3 border border-border-subtle text-text-secondary">
            {rule.category}
          </div>
        </div>

        <div className="bg-surface-2 rounded-xl p-3.5 border border-border-subtle">
          <div className="text-[11px] font-semibold text-text-muted mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-accent-blue" /> Computation
          </div>
          <div className="text-xs font-medium text-text-secondary">
            Type: <span className="font-semibold text-text-main">{rule.type || rule.computation_type || 'Fixed'}</span>
          </div>
          <div className="mt-2 font-mono text-xs text-accent-blue bg-accent-blue/10 border border-accent-blue/20 p-2.5 rounded-lg break-all">
            {rule.formula || (rule.amount ? `₹${rule.amount}` : `${rule.percentage || (rule.amount ? rule.amount * 100 : 0)}% of ${rule.computation_basis || 'BASIC'}`)}
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">Evaluation Sequence</h4>
          <div className="bg-surface-2 px-3 py-2 rounded-lg border border-border-subtle text-xs font-mono text-text-secondary">
            Order Index: <span className="font-bold text-text-main">{rule.sequence ?? 10}</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border-subtle bg-surface-1 dark:bg-[#161B22]">
        <Button 
          onClick={() => onEdit ? onEdit(rule) : null}
          variant="primary" 
          className="w-full flex items-center justify-center gap-2 shadow-sm"
        >
          <Edit2 className="w-4 h-4" />
          Edit Rule
        </Button>
      </div>
    </div>
  );
};

export default RuleSidePanel;
