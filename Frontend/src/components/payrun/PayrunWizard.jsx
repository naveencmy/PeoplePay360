import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, ChevronRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreatePayrun } from '@/hooks/usePayrun';
import { useEmployees } from '@/hooks/useEmployees';
import { useSalaryStructures } from '@/hooks/useSalary';
import * as api from '@/api/realApi';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export const PayrunWizard = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [periodName, setPeriodName] = useState('September 2026 Payroll');
  const [periodStart, setPeriodStart] = useState('2026-09-01');
  const [periodEnd, setPeriodEnd] = useState('2026-09-30');
  const [selectedStructureId, setSelectedStructureId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: employees = [] } = useEmployees({ search, limit: 100 });
  const { data: structures = [] } = useSalaryStructures();
  const { mutateAsync: createPayrun, isPending: isCreating } = useCreatePayrun();

  if (!isOpen) return null;

  const handleNext = () => setStep(2);

  const handleCreate = async () => {
    setIsProcessing(true);
    try {
      const res = await createPayrun({
        name: periodName,
        period_start: periodStart,
        period_end: periodEnd,
        structure_id: selectedStructureId || (structures[0]?.id || null),
        employeeIds: selectedEmployees,
      });
      const createdPayrun = res?.data || res;
      const payrunId = createdPayrun?.id;

      if (payrunId) {
        try {
          await api.computePayrun(payrunId);
        } catch (compErr) {
          console.warn('Initial compute on creation warning:', compErr);
        }
        await queryClient.invalidateQueries({ queryKey: ['payruns'] });
        await queryClient.invalidateQueries({ queryKey: ['payrun', payrunId] });
        await queryClient.invalidateQueries({ queryKey: ['payslips'] });
        toast.success('Payrun created and computed successfully!');
        navigate(`/payruns/${payrunId}`);
      }
      onClose();
    } catch (e) {
      console.error('Failed to create payrun:', e);
      toast.error('Failed to create payrun cycle');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map((e) => e.id));
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
    >
      <div className="bg-surface-2 dark:bg-[#161B22] border border-border-subtle dark:border-white/10 rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header & Stepper */}
        <div className="p-6 border-b border-border-subtle dark:border-white/10 bg-surface-1 dark:bg-[#161B22]">
          <div className="flex items-center justify-between mb-6">
            <h2 id="wizard-title" className="text-2xl font-semibold text-text-main">Create New Payrun</h2>
            <button 
              onClick={onClose} 
              className="text-text-muted hover:text-text-main transition-colors p-2 rounded-lg"
              aria-label="Close payrun wizard"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-4" aria-label="Wizard Steps">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-accent-blue font-semibold' : 'text-text-muted'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium border-2 ${step >= 1 ? 'border-accent-blue bg-accent-blue/10 text-accent-blue' : 'border-border-subtle text-text-muted'}`} aria-current={step === 1 ? 'step' : undefined}>1</div>
              <span className="font-medium text-sm">Scope & Dates</span>
            </div>
            <div className={`h-px w-16 ${step >= 2 ? 'bg-accent-blue' : 'bg-border-subtle'}`} aria-hidden="true"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-accent-blue font-semibold' : 'text-text-muted'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium border-2 ${step >= 2 ? 'border-accent-blue bg-accent-blue/10 text-accent-blue' : 'border-border-subtle text-text-muted'}`} aria-current={step === 2 ? 'step' : undefined}>2</div>
              <span className="font-medium text-sm">Select Employees</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-base dark:bg-[#0B0D10]">
          {step === 1 ? (
            <div className="max-w-xl mx-auto space-y-6 pt-4">
              <div className="space-y-2">
                <label htmlFor="pay-structure-select" className="text-sm font-medium text-text-secondary">
                  Salary Structure
                </label>
                <select 
                  id="pay-structure-select"
                  value={selectedStructureId}
                  onChange={(e) => setSelectedStructureId(e.target.value)}
                  className="w-full bg-surface-1 dark:bg-[#161B22] border border-border-subtle dark:border-white/10 rounded-lg p-3 text-text-main appearance-none focus:border-accent-blue focus:outline-none"
                >
                  {structures.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="period-name-input" className="text-sm font-medium text-text-secondary">
                  Payrun Title
                </label>
                <input 
                  id="period-name-input"
                  type="text" 
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  className="w-full bg-surface-1 dark:bg-[#161B22] border border-border-subtle dark:border-white/10 rounded-lg p-3 text-text-main focus:border-accent-blue focus:outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="period-start-input" className="text-sm font-medium text-text-secondary">
                    Period Start
                  </label>
                  <input 
                    id="period-start-input"
                    type="date" 
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full bg-surface-1 dark:bg-[#161B22] border border-border-subtle dark:border-white/10 rounded-lg p-3 text-text-main focus:border-accent-blue focus:outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="period-end-input" className="text-sm font-medium text-text-secondary">
                    Period End
                  </label>
                  <input 
                    id="period-end-input"
                    type="date" 
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full bg-surface-1 dark:bg-[#161B22] border border-border-subtle dark:border-white/10 rounded-lg p-3 text-text-main focus:border-accent-blue focus:outline-none" 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-main">Select Eligible Employees</h3>
                  <p className="text-sm text-text-muted">Total active employees: {employees.length}</p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input 
                    type="text" 
                    placeholder="Search employees..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Filter employees"
                    className="pl-9 pr-4 py-2 bg-surface-1 dark:bg-[#161B22] border border-border-subtle dark:border-white/10 rounded-lg text-sm text-text-main focus:border-accent-blue focus:outline-none w-64" 
                  />
                </div>
              </div>

              <div className="flex-1 bg-surface-1 dark:bg-[#161B22] border border-border-subtle dark:border-white/10 rounded-lg overflow-y-auto max-h-[46vh] flex flex-col shadow-inner">
                <table className="w-full text-left border-collapse" aria-label="Employees table">
                  <thead className="sticky top-0 z-10 bg-surface-2 dark:bg-[#1c222d] border-b border-border-subtle dark:border-white/10 shadow-sm">
                    <tr>
                      <th className="p-3 w-12 text-center">
                        <input 
                          type="checkbox" 
                          checked={employees.length > 0 && selectedEmployees.length === employees.length}
                          onChange={toggleAll}
                          aria-label="Select all employees"
                          className="rounded border-border-subtle text-accent-blue focus:ring-accent-blue cursor-pointer" 
                        />
                      </th>
                      <th className="p-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Employee</th>
                      <th className="p-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Department</th>
                      <th className="p-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Position</th>
                      <th className="p-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle dark:divide-white/5">
                    {employees.map((emp) => (
                      <tr 
                        key={emp.id} 
                        className="hover:bg-surface-3/50 dark:hover:bg-white/5 cursor-pointer transition-colors" 
                        onClick={() => toggleEmployee(emp.id)}
                      >
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={selectedEmployees.includes(emp.id)}
                            onChange={() => toggleEmployee(emp.id)}
                            aria-label={`Select ${emp.name}`}
                            className="rounded border-border-subtle text-accent-blue focus:ring-accent-blue cursor-pointer" 
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-sm text-text-main">{emp.name}</div>
                          <div className="text-xs font-mono text-text-muted">{emp.employeeId}</div>
                        </td>
                        <td className="p-3 text-sm text-text-secondary">{emp.department}</td>
                        <td className="p-3 text-sm text-text-secondary">{emp.jobPosition}</td>
                        <td className="p-3 text-sm font-medium text-emerald-500">{emp.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border-subtle dark:border-white/10 bg-surface-1 dark:bg-[#161B22] flex items-center justify-between">
          {step === 1 ? (
            <div></div>
          ) : (
            <div className="text-sm text-text-secondary">
              <span className="font-semibold text-text-main">{selectedEmployees.length}</span> of {employees.length} employees selected
            </div>
          )}

          <div className="flex gap-3">
            {step === 2 && (
              <Button variant="outline" onClick={() => setStep(1)} className="min-h-[40px]">Back</Button>
            )}
            {step === 1 ? (
              <Button onClick={handleNext} className="bg-accent-blue hover:bg-blue-600 text-white flex items-center gap-2 min-h-[40px]">
                Continue <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button 
                onClick={handleCreate} 
                disabled={selectedEmployees.length === 0 || isCreating || isProcessing}
                className="bg-accent-blue hover:bg-blue-600 text-white disabled:opacity-50 min-h-[40px] gap-2"
              >
                {isCreating || isProcessing ? 'Calculating & Creating Payrun...' : 'Create & Calculate Payrun'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrunWizard;
