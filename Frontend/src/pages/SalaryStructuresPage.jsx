import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, FileText } from 'lucide-react';
import { useSalaryStructures } from '@/hooks/useSalary';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';

export const SalaryStructuresPage = () => {
  const navigate = useNavigate();
  const { data: structures, isLoading, error } = useSalaryStructures();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="Salary Structures" 
        subtitle="Define pay component frameworks for different employee categories"
        action={
          <Button onClick={() => setIsModalOpen(true)} className="bg-[#4F7CFF] hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            New Structure
          </Button>
        }
      />

      <div className="bg-[#161B22] rounded-lg border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading structures...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">Error loading structures</div>
        ) : !structures?.length ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-white">No salary structures yet</h3>
            <p className="text-gray-400 mt-1 mb-4">Create your first salary structure to get started.</p>
            <Button onClick={() => setIsModalOpen(true)} className="bg-[#4F7CFF]">
              Create Structure
            </Button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium"># Rules</th>
                <th className="p-4 font-medium"># Contracts Using It</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {structures.map((structure) => (
                <tr 
                  key={structure.id} 
                  onClick={() => navigate(`/salary-rules/${structure.id}`)}
                  className="border-b border-white/10 hover:bg-white/5 cursor-pointer transition-colors text-gray-200"
                >
                  <td className="p-4 font-medium text-white">{structure.name}</td>
                  <td className="p-4">{structure.rulesCount || 0}</td>
                  <td className="p-4">{structure.contractsCount || 0}</td>
                  <td className="p-4">
                    <StatusPill status={structure.status} />
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-white rounded hover:bg-white/10 transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#161B22] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Create Salary Structure</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Structure Name</label>
                <input type="text" className="w-full bg-[#0B0D10] border border-white/10 rounded p-2 text-white" placeholder="e.g. Regular Employees" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button className="bg-[#4F7CFF] hover:bg-blue-600" onClick={() => setIsModalOpen(false)}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryStructuresPage;
