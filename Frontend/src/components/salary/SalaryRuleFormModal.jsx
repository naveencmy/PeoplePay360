import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PlayCircle, AlertCircle } from 'lucide-react';
import { useCreateSalaryRule, useUpdateSalaryRule, useValidateGraph } from '@/hooks/useSalary';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export const SalaryRuleFormModal = ({ isOpen, onClose, rule, structureId }) => {
  const isEditing = !!rule;
  const createRule = useCreateSalaryRule();
  const updateRule = useUpdateSalaryRule();
  const { data: validationResult } = useValidateGraph(structureId);

  const [computationType, setComputationType] = useState('Fixed');
  const [formulaPreview, setFormulaPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      code: '',
      category: 'BASIC',
      sequence: 10,
      amount: '',
      computation_basis: 'WAGE',
      formula: '',
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (rule) {
        const cType = rule.computation_type === 'FORMULA' || rule.type === 'Formula'
          ? 'Formula'
          : rule.computation_type === 'PERCENTAGE' || rule.type === 'Percentage'
          ? 'Percentage'
          : 'Fixed';
        setComputationType(cType);
        reset({
          name: rule.name || '',
          code: rule.code || '',
          category: rule.category || 'BASIC',
          sequence: rule.sequence !== undefined ? rule.sequence : 10,
          amount: cType === 'Percentage' 
            ? (rule.amount ? rule.amount * 100 : '') 
            : (rule.amount !== undefined ? rule.amount : ''),
          computation_basis: rule.computation_basis || 'WAGE',
          formula: rule.formula || '',
        });
      } else {
        setComputationType('Fixed');
        reset({
          name: '',
          code: '',
          category: 'BASIC',
          sequence: 10,
          amount: '',
          computation_basis: 'WAGE',
          formula: '',
        });
      }
      setFormulaPreview(false);
    }
  }, [isOpen, rule, reset]);

  if (!isOpen) return null;

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const compTypeNormalized = computationType.toUpperCase();
      const rawAmount = parseFloat(formData.amount) || 0;
      const finalAmount = compTypeNormalized === 'PERCENTAGE' ? (rawAmount / 100) : rawAmount;

      const payload = {
        structure_id: structureId,
        structureId: structureId,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        category: formData.category,
        sequence: parseInt(formData.sequence, 10) || 10,
        computation_type: compTypeNormalized,
        amount: finalAmount,
        computation_basis: compTypeNormalized === 'PERCENTAGE' ? formData.computation_basis : null,
        formula: compTypeNormalized === 'FORMULA' ? formData.formula : null,
        active: true,
      };

      if (isEditing) {
        await updateRule.mutateAsync({ id: rule.id, data: payload });
        toast.success('Salary rule updated successfully');
      } else {
        await createRule.mutateAsync(payload);
        toast.success('Salary rule created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Failed to save salary rule:', error);
      const errMsg = error?.response?.data?.message || error?.message || 'Failed to save salary rule';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Salary Rule' : 'New Salary Rule'}
      subtitle="Define rule code, statutory category, calculation parameters, and execution sequence"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="salary-rule-form" 
            variant="primary" 
            disabled={isSubmitting}
            className="shadow-sm gap-2 min-w-[120px]"
          >
            {isSubmitting 
              ? (isEditing ? 'Saving...' : 'Creating...') 
              : (isEditing ? 'Save Changes' : 'Create Rule')}
          </Button>
        </div>
      }
    >
      <form id="salary-rule-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Rule Name <span className="text-accent-rose">*</span>
            </label>
            <input 
              type="text" 
              {...register('name', { required: 'Rule name is required' })}
              className="w-full bg-surface-2 border border-border-subtle rounded-xl p-2.5 text-sm text-text-main focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors" 
              placeholder="e.g. Basic Salary" 
            />
            {errors.name && <p className="text-xs text-accent-rose">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Rule Code <span className="text-accent-rose">*</span>
            </label>
            <input 
              type="text" 
              {...register('code', { 
                required: 'Rule code is required',
                pattern: {
                  value: /^[A-Z][A-Z0-9_]*$/,
                  message: 'Must start with capital letter, only uppercase letters, numbers and underscores'
                }
              })}
              onChange={(e) => setValue('code', e.target.value.toUpperCase())}
              className="w-full bg-surface-2 border border-border-subtle rounded-xl p-2.5 text-sm text-text-main font-mono uppercase focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors" 
              placeholder="e.g. BASIC" 
            />
            {errors.code && <p className="text-xs text-accent-rose">{errors.code.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Statutory Category <span className="text-accent-rose">*</span>
            </label>
            <select 
              {...register('category', { required: true })}
              className="w-full bg-surface-2 border border-border-subtle rounded-xl p-2.5 text-sm text-text-main focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue cursor-pointer transition-colors"
            >
              <option value="BASIC">BASIC</option>
              <option value="ALLOWANCE">ALLOWANCE</option>
              <option value="GROSS">GROSS</option>
              <option value="DEDUCTION">DEDUCTION</option>
              <option value="NET">NET</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Execution Sequence <span className="text-accent-rose">*</span>
            </label>
            <input 
              type="number" 
              {...register('sequence', { required: true, valueAsNumber: true })}
              className="w-full bg-surface-2 border border-border-subtle rounded-xl p-2.5 text-sm text-text-main font-mono focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors" 
              placeholder="10"
            />
            <p className="text-[11px] text-text-muted">Order of evaluation (lower numbers calculate first)</p>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-border-subtle">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Computation Type
          </label>
          <div className="flex flex-wrap gap-4">
            {['Fixed', 'Percentage', 'Formula'].map((type) => (
              <label 
                key={type} 
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border cursor-pointer transition-all ${
                  computationType === type 
                    ? 'bg-accent-blue/10 border-accent-blue text-accent-blue font-semibold shadow-sm' 
                    : 'bg-surface-2 border-border-subtle text-text-secondary hover:text-text-main hover:bg-surface-3'
                }`}
              >
                <input 
                  type="radio" 
                  name="compType" 
                  value={type} 
                  checked={computationType === type}
                  onChange={(e) => setComputationType(e.target.value)}
                  className="text-accent-blue focus:ring-accent-blue cursor-pointer"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {computationType === 'Fixed' && (
          <div className="space-y-1.5 p-4 rounded-xl bg-surface-2/60 border border-border-subtle">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Fixed Amount (₹) <span className="text-accent-rose">*</span>
            </label>
            <input 
              type="number" 
              step="any"
              {...register('amount')}
              className="w-full bg-surface-1 border border-border-subtle rounded-xl p-2.5 text-sm text-text-main font-mono focus:border-accent-blue focus:outline-none" 
              placeholder="0.00" 
            />
            <p className="text-[11px] text-text-muted">A flat rupee compensation or deduction value</p>
          </div>
        )}

        {computationType === 'Percentage' && (
          <div className="p-4 rounded-xl bg-surface-2/60 border border-border-subtle space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Percentage (%) <span className="text-accent-rose">*</span>
                </label>
                <input 
                  type="number" 
                  step="any"
                  {...register('amount')}
                  className="w-full bg-surface-1 border border-border-subtle rounded-xl p-2.5 text-sm text-text-main font-mono focus:border-accent-blue focus:outline-none" 
                  placeholder="e.g. 40" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Percentage Of <span className="text-accent-rose">*</span>
                </label>
                <select 
                  {...register('computation_basis')}
                  className="w-full bg-surface-1 border border-border-subtle rounded-xl p-2.5 text-sm text-text-main focus:border-accent-blue focus:outline-none cursor-pointer"
                >
                  <option value="WAGE">WAGE (Base Contract Wage)</option>
                  <option value="BASIC">BASIC</option>
                  <option value="GROSS">GROSS</option>
                  <option value="NET">NET</option>
                </select>
              </div>
            </div>
            <p className="text-[11px] text-text-muted">Example: 40% of BASIC for House Rent Allowance (HRA)</p>
          </div>
        )}

        {computationType === 'Formula' && (
          <div className="space-y-3 p-4 rounded-xl bg-surface-2/60 border border-border-subtle">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Algebraic Formula <span className="text-accent-rose">*</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => setFormulaPreview(!formulaPreview)}
                  className="text-xs text-accent-blue hover:underline flex items-center gap-1 font-medium"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>{formulaPreview ? 'Hide Order' : 'Preview Execution'}</span>
                </button>
              </div>
              <textarea 
                rows={3}
                {...register('formula')}
                className="w-full bg-surface-1 border border-border-subtle rounded-xl p-3 text-text-main font-mono text-xs focus:border-accent-blue focus:outline-none" 
                placeholder="e.g. BASIC * 0.40 + HRA - PF"
              />
              <p className="text-[11px] text-text-muted">Use standard mathematical operators (+, -, *, /) and uppercase rule codes.</p>
            </div>

            {formulaPreview && (
              <div className="p-3.5 bg-surface-1 rounded-xl border border-border-subtle animate-fade-in">
                <h4 className="text-xs font-bold text-text-main mb-1.5 flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5 text-accent-blue" />
                  <span>Execution Sequence Flow</span>
                </h4>
                <ol className="list-decimal list-inside text-xs text-text-secondary space-y-1 font-mono">
                  <li>BASIC (Base Wage scale)</li>
                  <li>HRA (Calculated from BASIC)</li>
                  <li className="text-accent-blue font-bold">This Rule (Evaluated with defined sequence)</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
};

export default SalaryRuleFormModal;
