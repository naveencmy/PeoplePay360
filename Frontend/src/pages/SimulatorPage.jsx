import React, { useState } from 'react';
import { useCreateSimulation, useRunSimulation } from '@/hooks/useSimulator';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const SimulatorPage = () => {
  const [structure, setStructure] = useState('Standard 2024');
  const [overrides, setOverrides] = useState([{ id: 1, name: 'Basic Pay %', current: 40, newValue: 40 }]);
  const [targetEmployees, setTargetEmployees] = useState('All');
  
  const { mutate: createSim } = useCreateSimulation();
  const { mutate: runSim, data: results, isLoading, reset } = useRunSimulation();

  const handleAddOverride = () => {
    setOverrides([...overrides, { id: Date.now(), name: 'New Rule', current: 0, newValue: 0 }]);
  };

  const handleUpdateOverride = (id, val) => {
    setOverrides(overrides.map(o => o.id === id ? { ...o, newValue: Number(val) } : o));
  };

  const handleRemoveOverride = (id) => {
    setOverrides(overrides.filter(o => o.id !== id));
  };

  const handleRun = () => {
    runSim({ structure, overrides, targetEmployees });
  };

  return (
    <div className="p-6 bg-[#0B0D10] text-gray-100 min-h-screen">
      <div className="flex gap-6 h-[calc(100vh-6rem)]">
        {/* Left Panel - Configuration */}
        <div className="w-1/3 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold">What-If Simulator</h1>
            <span className="px-2 py-1 text-xs font-medium bg-[#4F7CFF]/20 text-[#4F7CFF] rounded-full border border-[#4F7CFF]/30">Intelligence</span>
          </div>
          
          <div className="bg-[#161B22] border border-blue-500/30 text-blue-200 p-3 rounded-lg text-sm flex gap-2 items-center">
            <span className="text-blue-400">ℹ️</span> Simulation only - no production salary rules were modified.
          </div>

          <Card className="p-5 bg-[#161B22] border-white/10 flex-1 overflow-y-auto">
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Base Salary Structure</label>
              <select 
                className="w-full bg-[#0B0D10] border border-white/10 rounded-md p-2 text-white outline-none focus:border-[#4F7CFF]"
                value={structure} onChange={e => setStructure(e.target.value)}
              >
                <option>Standard 2024</option>
                <option>Executive Package</option>
                <option>Contractor Scale</option>
              </select>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm text-gray-400">Parameter Overrides</label>
                <button onClick={handleAddOverride} className="text-xs text-[#4F7CFF] hover:underline">+ Add Rule</button>
              </div>
              <div className="space-y-4">
                {overrides.map(rule => (
                  <div key={rule.id} className="bg-[#0B0D10] p-3 rounded border border-white/5">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{rule.name}</span>
                      <button onClick={() => handleRemoveOverride(rule.id)} className="text-gray-500 hover:text-red-400">×</button>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-gray-500 w-20">Cur: {rule.current}</div>
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={rule.newValue} 
                        onChange={(e) => handleUpdateOverride(rule.id, e.target.value)}
                        className="flex-1 accent-[#4F7CFF]"
                      />
                      <input 
                        type="number" 
                        value={rule.newValue} 
                        onChange={(e) => handleUpdateOverride(rule.id, e.target.value)}
                        className="w-16 bg-[#161B22] border border-white/10 rounded p-1 text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm text-gray-400 mb-2">Select Employees</label>
              <select 
                className="w-full bg-[#0B0D10] border border-white/10 rounded-md p-2 text-white outline-none focus:border-[#4F7CFF]"
                value={targetEmployees} onChange={e => setTargetEmployees(e.target.value)}
              >
                <option>All Employees</option>
                <option>Engineering Dept</option>
                <option>Custom Selection...</option>
              </select>
            </div>

            <Button 
              onClick={handleRun} 
              disabled={isLoading}
              className="w-full bg-[#4F7CFF] hover:bg-[#3B66E5] text-white py-3 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Running Simulation...' : 'Run Simulation'}
            </Button>
          </Card>
        </div>

        {/* Right Panel - Results */}
        <div className="w-2/3">
          {!results && !isLoading ? (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl text-gray-500">
              Configure parameters and run simulation to see projection.
            </div>
          ) : isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-[#4F7CFF]">
              <div className="w-12 h-12 border-4 border-[#4F7CFF]/30 border-t-[#4F7CFF] rounded-full animate-spin mb-4"></div>
              <p>Calculating impact across {targetEmployees === 'All' ? 'all' : 'selected'} employees...</p>
            </div>
          ) : (
            <div className="h-full flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4 bg-[#161B22] border-white/10">
                  <h3 className="text-sm text-gray-400 mb-1">Current Monthly</h3>
                  <p className="text-2xl font-bold">{results.currentTotal}</p>
                </Card>
                <Card className="p-4 bg-[#161B22] border-white/10">
                  <h3 className="text-sm text-gray-400 mb-1">Projected Monthly</h3>
                  <p className="text-2xl font-bold">{results.projectedTotal}</p>
                </Card>
                <Card className="p-4 bg-[#161B22] border-white/10">
                  <h3 className="text-sm text-gray-400 mb-1">Difference</h3>
                  <p className={`text-2xl font-bold ${results.deltaValue > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {results.deltaValue > 0 ? '+' : ''}{results.deltaFormatted} ({results.deltaPercent}%)
                  </p>
                </Card>
                <Card className="p-4 bg-[#161B22] border-white/10">
                  <h3 className="text-sm text-gray-400 mb-1">Annualized Impact</h3>
                  <p className={`text-2xl font-bold ${results.annualDeltaValue > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {results.annualDeltaValue > 0 ? '+' : ''}{results.annualDeltaFormatted}
                  </p>
                </Card>
              </div>

              <Card className="flex-1 p-5 bg-[#161B22] border-white/10 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Department Breakdown</h3>
                  <Button onClick={reset} className="text-sm bg-transparent border border-white/20 hover:bg-white/5 text-white px-3 py-1 rounded">
                    Reset Simulation
                  </Button>
                </div>
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-sm text-left">
                    <thead className="text-gray-400 border-b border-white/10 sticky top-0 bg-[#161B22]">
                      <tr>
                        <th className="pb-3 font-medium">Department</th>
                        <th className="pb-3 font-medium text-right">Headcount</th>
                        <th className="pb-3 font-medium text-right">Current</th>
                        <th className="pb-3 font-medium text-right">Projected</th>
                        <th className="pb-3 font-medium text-right">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.departments?.map((dept, i) => (
                        <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                          <td className="py-3 text-white">{dept.name}</td>
                          <td className="py-3 text-right text-gray-400">{dept.headcount}</td>
                          <td className="py-3 text-right text-gray-300">{dept.current}</td>
                          <td className="py-3 text-right text-white font-medium">{dept.projected}</td>
                          <td className={`py-3 text-right font-medium ${dept.deltaValue > 0 ? 'text-red-400' : dept.deltaValue < 0 ? 'text-green-400' : 'text-gray-500'}`}>
                            {dept.deltaValue > 0 ? '+' : ''}{dept.deltaFormatted}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulatorPage;
