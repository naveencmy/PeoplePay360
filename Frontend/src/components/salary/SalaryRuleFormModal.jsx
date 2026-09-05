import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, PlayCircle } from 'lucide-react';
import { useCreateSalaryRule, useUpdateSalaryRule, useValidateGraph } from '@/hooks/useSalary';
import { Button } from '@/components/ui/Button';

export const SalaryRuleFormModal = ({ isOpen, onClose, rule, structureId }) => {
  const isEditing = !!rule;
  const { mutate: createRule } = useCreateSalaryRule();
  const { mutate: updateRule } = useUpdateSalaryRule();
  const { data: validationResult, refetch: validateGraph } = useValidateGraph(structureId);

  const [computationType, setComputationType] = useState(rule?.computationType || 'Fixed');
  const [formulaPreview, setFormulaPreview] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#161B22] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? 'Edit Salary Rule' : 'New Salary Rule'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="rule-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Name</label>
                <input 
                  type="text" 
                  defaultValue={rule?.name} 
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#4F7CFF] focus:outline-none transition-colors" 
                  placeholder="e.g. Basic Salary" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Code</label>
                <input 
                  type="text" 
                  defaultValue={rule?.code} 
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-lg p-2.5 text-white uppercase focus:border-[#4F7CFF] focus:outline-none transition-colors" 
                  placeholder="e.g. BASIC" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Category</label>
                <select className="w-full bg-[#0B0D10] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#4F7CFF] focus:outline-none appearance-none">
                  <option value="BASIC">BASIC</option>
                  <option value="ALLOWANCE">ALLOWANCE</option>
                  <option value="GROSS">GROSS</option>
                  <option value="DEDUCTION">DEDUCTION</option>
                  <option value="NET">NET</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Sequence</label>
                <input 
                  type="number" 
                  defaultValue={rule?.sequence || 10} 
                  className="w-full bg-[#0B0D10] border border-white/10 rounded-lg p-2.5 text-white focus:border-[#4F7CFF] focus:outline-none transition-colors" 
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <label className="text-sm font-medium text-gray-400">Computation Type</label>
              <div className="flex gap-4">
                {['Fixed', 'Percentage', 'Formula'].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="compType" 
                      value={type} 
                      checked={computationType === type}
                      onChange={(e) => setComputationType(e.target.value)}
                      className="text-[#4F7CFF] focus:ring-[#4F7CFF] bg-[#0B0D10] border-gray-600"
                    />
                    <span className="text-sm text-gray-200">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {computationType === 'Fixed' && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Amount</label>
                <input type="number" className="w-full bg-[#0B0D10] border border-white/10 rounded-lg p-2.5 text-white" placeholder="0.00" />
              </div>
            )}

            {computationType === 'Percentage' && (
              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-400">Percentage (%)</label>
                  <input type="number" className="w-full bg-[#0B0D10] border border-white/10 rounded-lg p-2.5 text-white" placeholder="40" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-400">Of</label>
                  <select className="w-full bg-[#0B0D10] border border-white/10 rounded-lg p-2.5 text-white appearance-none">
                    <option>BASIC</option>
                    <option>GROSS</option>
                  </select>
                </div>
              </div>
            )}

            {computationType === 'Formula' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-400">Formula</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-[#0B0D10] border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:border-[#4F7CFF] focus:outline-none" 
                    placeholder="e.g. BASIC * 0.4 + HRA"
                  ></textarea>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFormulaPreview(true)}
                  className="w-full flex items-center justify-center gap-2 border-white/10 hover:bg-white/5"
                >
                  <PlayCircle className="w-4 h-4 text-[#4F7CFF]" />
                  <span className="text-gray-300">Preview Dependency Order</span>
                </Button>

                {formulaPreview && (
                  <div className="bg-[#0B0D10] border border-white/10 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-2">Execution Order</h4>
                    <ol className="list-decimal list-inside text-sm text-gray-400 space-y-1">
                      <li>BASIC</li>
                      <li>HRA</li>
                      <li className="text-[#4F7CFF]">Current Rule</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-[#161B22] rounded-b-xl">
          <Button variant="outline" onClick={onClose} className="border-white/10 hover:bg-white/5">Cancel</Button>
          <Button form="rule-form" type="submit" className="bg-[#4F7CFF] hover:bg-blue-600">
            {isEditing ? 'Save Changes' : 'Create Rule'}
          </Button>
        </div>
      </div>
    </div>
  );
};
