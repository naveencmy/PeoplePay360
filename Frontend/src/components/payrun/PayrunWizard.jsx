import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, ChevronRight } from 'lucide-react';
import { useCreatePayrun } from '@/hooks/usePayrun';
import { useEmployees } from '@/hooks/useEmployees';
import { useSalaryStructures } from '@/hooks/useSalary';
import { Button } from '@/components/ui/Button';

export const PayrunWizard = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [periodName, setPeriodName] = useState('September 2026 Payroll');
  const [periodStart, setPeriodStart] = useState('2026-09-01');
  const [periodEnd, setPeriodEnd] = useState('2026-09-30');
  const [selectedStructureId, setSelectedStructureId] = useState('');

  const { data: employees = [] } = useEmployees({ search });
  const { data: structures = [] } = useSalaryStructures();
  const { mutateAsync: createPayrun, isPending: isCreating } = useCreatePayrun();

  if (!isOpen) return null;

  const handleNext = () => setStep(2);

  const handleCreate = async () => {
    try {
      const newPayrun = await createPayrun({
        name: periodName,
        period_start: periodStart,
        period_end: periodEnd,
        structure_id: selectedStructureId || (structures[0]?.id || null),
        employeeIds: selectedEmployees,
      });
      navigate(`/payruns/${newPayrun.id}`);
      onClose();
    } catch (e) {
      console.error('Failed to create payrun:', e);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
    >
      <div className="bg-[#161B22] border border-white/10 rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl">
        {/* Header & Stepper */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 id="wizard-title" className="text-2xl font-semibold text-white">Create New Payrun</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg"
              aria-label="Close payrun wizard"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-4" aria-label="Wizard Steps">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#4F7CFF]' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium border-2 ${step >= 1 ? 'border-[#4F7CFF] bg-[#4F7CFF]/10' : 'border-gray-600'}`} aria-current={step === 1 ? 'step' : undefined}>1</div>
              <span className="font-medium">Scope & Dates</span>
            </div>
            <div className={`h-px w-16 ${step >= 2 ? 'bg-[#4F7CFF]' : 'bg-gray-700'}`} aria-hidden="true"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#4F7CFF]' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium border-2 ${step >= 2 ? 'border-[#4F7CFF] bg-[#4F7CFF]/10' : 'border-gray-600'}`} aria-current={step === 2 ? 'step' : undefined}>2</div>
              <span className="font-medium">Select Employees</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0B0D10]">
          {step === 1 ? (
            <div className="max-w-xl mx-auto space-y-6 pt-4">
              <div className="space-y-2">
                <label htmlFor="pay-structure-select" className="text-sm font-medium text-gray-300">
                  Salary Structure
                </label>
                <select 
                  id="pay-structure-select"
                  value={selectedStructureId}
                  onChange={(e) => setSelectedStructureId(e.target.value)}
                  className="w-full bg-[#161B22] border border-white/10 rounded-lg p-3 text-white appearance-none focus:border-[#4F7CFF] focus:outline-none"
                >
                  {structures.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="period-name-input" className="text-sm font-medium text-gray-300">
                  Payrun Title
                </label>
                <input 
                  id="period-name-input"
                  type="text" 
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  className="w-full bg-[#161B22] border border-white/10 rounded-lg p-3 text-white focus:border-[#4F7CFF] focus:outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="period-start-input" className="text-sm font-medium text-gray-300">
                    Period Start
                  </label>
                  <input 
                    id="period-start-input"
                    type="date" 
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full bg-[#161B22] border border-white/10 rounded-lg p-3 text-white focus:border-[#4F7CFF] focus:outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="period-end-input" className="text-sm font-medium text-gray-300">
                    Period End
                  </label>
                  <input 
                    id="period-end-input"
                    type="date" 
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full bg-[#161B22] border border-white/10 rounded-lg p-3 text-white focus:border-[#4F7CFF] focus:outline-none" 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">Select Eligible Employees</h3>
                  <p className="text-sm text-gray-400">Total active employees: {employees.length}</p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input 
                    type="text" 
                    placeholder="Search employees..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Filter employees"
                    className="pl-9 pr-4 py-2 bg-[#161B22] border border-white/10 rounded-lg text-sm text-white focus:border-[#4F7CFF] focus:outline-none w-64" 
                  />
                </div>
              </div>

              <div className="flex-1 bg-[#161B22] border border-white/10 rounded-lg overflow-hidden flex flex-col">
                <table className="w-full text-left border-collapse" aria-label="Employees table">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="p-3 w-12 text-center">
                        <input 
                          type="checkbox" 
                          checked={employees.length > 0 && selectedEmployees.length === employees.length}
                          onChange={toggleAll}
                          aria-label="Select all employees"
                          className="rounded border-gray-600 text-[#4F7CFF] focus:ring-[#4F7CFF]" 
                        />
                      </th>
                      <th className="p-3 text-sm font-medium text-gray-400">Employee</th>
                      <th className="p-3 text-sm font-medium text-gray-400">Department</th>
                      <th className="p-3 text-sm font-medium text-gray-400">Position</th>
                      <th className="p-3 text-sm font-medium text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr 
                        key={emp.id} 
                        className="border-b border-white/5 hover:bg-white/5 cursor-pointer" 
                        onClick={() => toggleEmployee(emp.id)}
                      >
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={selectedEmployees.includes(emp.id)}
                            onChange={() => toggleEmployee(emp.id)}
                            aria-label={`Select ${emp.name}`}
                            className="rounded border-gray-600 text-[#4F7CFF] focus:ring-[#4F7CFF]" 
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-white">{emp.name}</div>
                          <div className="text-xs text-gray-500">{emp.employeeId}</div>
                        </td>
                        <td className="p-3 text-sm text-gray-300">{emp.department}</td>
                        <td className="p-3 text-sm text-gray-300">{emp.jobPosition}</td>
                        <td className="p-3 text-sm text-emerald-400">{emp.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-[#161B22] flex items-center justify-between rounded-b-xl">
          {step === 1 ? (
            <div></div>
          ) : (
            <div className="text-sm text-gray-300">
              <span className="font-medium text-white">{selectedEmployees.length}</span> of {employees.length} employees selected
            </div>
          )}

          <div className="flex gap-3">
            {step === 2 && (
              <Button variant="outline" onClick={() => setStep(1)} className="border-white/10 min-h-[44px]">Back</Button>
            )}
            {step === 1 ? (
              <Button onClick={handleNext} className="bg-[#4F7CFF] hover:bg-blue-600 flex items-center gap-2 min-h-[44px]">
                Continue <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button 
                onClick={handleCreate} 
                disabled={selectedEmployees.length === 0 || isCreating}
                className="bg-[#4F7CFF] hover:bg-blue-600 disabled:opacity-50 min-h-[44px]"
              >
                {isCreating ? 'Creating Payrun...' : 'Create Payrun'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrunWizard;
