import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, ChevronRight } from 'lucide-react';
import { useCreatePayrun, useAddEmployees } from '@/hooks/usePayrun';
import { Button } from '@/components/ui/Button';

export const PayrunWizard = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  
  const { mutateAsync: createPayrun, isPending: isCreating } = useCreatePayrun();
  
  if (!isOpen) return null;

  const handleNext = () => setStep(2);
  
  const handleCreate = async () => {
    try {
      const newPayrun = await createPayrun({ scope: 'mock' });
      // Call useAddEmployees here in real implementation
      navigate(`/payruns/${newPayrun.id || 1}`);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleEmployee = (id) => {
    setSelectedEmployees(prev => 
      prev.includes(id) ? prev.filter(empId => empId !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#161B22] border border-white/10 rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl">
        
        {/* Header & Stepper */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Create New Payrun</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#4F7CFF]' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium border-2 ${step >= 1 ? 'border-[#4F7CFF] bg-[#4F7CFF]/10' : 'border-gray-600'}`}>1</div>
              <span className="font-medium">Scope</span>
            </div>
            <div className={`h-px w-16 ${step >= 2 ? 'bg-[#4F7CFF]' : 'bg-gray-700'}`}></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#4F7CFF]' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium border-2 ${step >= 2 ? 'border-[#4F7CFF] bg-[#4F7CFF]/10' : 'border-gray-600'}`}>2</div>
              <span className="font-medium">Select Employees</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0B0D10]">
          {step === 1 ? (
            <div className="max-w-xl mx-auto space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Pay Structure</label>
                <select className="w-full bg-[#161B22] border border-white/10 rounded-lg p-3 text-white appearance-none focus:border-[#4F7CFF] focus:outline-none">
                  <option>Regular Employees (Full-time)</option>
                  <option>Contractors</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Period Name</label>
                <input type="text" defaultValue="March 2026" className="w-full bg-[#161B22] border border-white/10 rounded-lg p-3 text-white focus:border-[#4F7CFF] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Period Start</label>
                  <input type="date" className="w-full bg-[#161B22] border border-white/10 rounded-lg p-3 text-white focus:border-[#4F7CFF] focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Period End</label>
                  <input type="date" className="w-full bg-[#161B22] border border-white/10 rounded-lg p-3 text-white focus:border-[#4F7CFF] focus:outline-none" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">Select Employee Records</h3>
                  <p className="text-sm text-gray-400">Showing 1-10 / 45 employees</p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Search employees..." className="pl-9 pr-4 py-2 bg-[#161B22] border border-white/10 rounded-lg text-sm text-white focus:border-[#4F7CFF] focus:outline-none w-64" />
                </div>
              </div>

              <div className="flex-1 bg-[#161B22] border border-white/10 rounded-lg overflow-hidden flex flex-col">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="p-3 w-12 text-center">
                        <input type="checkbox" className="rounded border-gray-600 text-[#4F7CFF] focus:ring-[#4F7CFF]" />
                      </th>
                      <th className="p-3 text-sm font-medium text-gray-400">Employee</th>
                      <th className="p-3 text-sm font-medium text-gray-400">Department</th>
                      <th className="p-3 text-sm font-medium text-gray-400">Working Hours</th>
                      <th className="p-3 text-sm font-medium text-gray-400">Wage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1,2,3,4,5].map(id => (
                      <tr key={id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer" onClick={() => toggleEmployee(id)}>
                        <td className="p-3 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedEmployees.includes(id)}
                            readOnly
                            className="rounded border-gray-600 text-[#4F7CFF] focus:ring-[#4F7CFF]" 
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-white">Employee Name {id}</div>
                          <div className="text-xs text-gray-500">EMP-00{id}</div>
                        </td>
                        <td className="p-3 text-sm text-gray-300">Engineering</td>
                        <td className="p-3 text-sm text-gray-300">160h</td>
                        <td className="p-3 text-sm text-gray-300">$5,000</td>
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
              <span className="font-medium text-white">{selectedEmployees.length}</span> employees selected
            </div>
          )}
          
          <div className="flex gap-3">
            {step === 2 && (
              <Button variant="outline" onClick={() => setStep(1)} className="border-white/10">Back</Button>
            )}
            {step === 1 ? (
              <Button onClick={handleNext} className="bg-[#4F7CFF] hover:bg-blue-600 flex items-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleCreate} 
                disabled={selectedEmployees.length === 0 || isCreating}
                className="bg-[#4F7CFF] hover:bg-blue-600 disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Payrun'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
