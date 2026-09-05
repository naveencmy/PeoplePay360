import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export const CreateEditUserPanel = ({ user, onClose }) => {
  const isEdit = !!user;
  
  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    role: 'Employee',
    status: 'Active'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        employeeId: user.linkedEmployeeId || '',
        email: user.email || '',
        role: user.role || 'Employee',
        status: user.status || 'Active'
      });
    }
  }, [user]);

  const roles = ['Employee', 'HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate save
    onClose();
  };

  return (
    <div className="h-full flex flex-col bg-[#161B22] text-gray-200">
      <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0B0D10]">
        <h2 className="text-xl font-semibold text-white">{isEdit ? 'Edit User Access' : 'Create New User'}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Linked Employee Record</label>
            <select 
              className="w-full bg-[#0B0D10] border border-white/10 rounded-md p-2.5 text-white outline-none focus:border-[#4F7CFF]"
              value={formData.employeeId}
              onChange={e => setFormData({...formData, employeeId: e.target.value})}
            >
              <option value="">-- Search & Select Employee --</option>
              <option value="emp-1">E001 - John Doe</option>
              <option value="emp-2">E002 - Jane Smith</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Links this login to an employee profile for self-service.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Work Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-[#0B0D10] border border-white/10 rounded-md p-2.5 text-white outline-none focus:border-[#4F7CFF]"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">System Role</label>
            <div className="space-y-2 bg-[#0B0D10] p-3 rounded-md border border-white/5">
              {roles.map(r => (
                <label key={r} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded">
                  <input 
                    type="radio" 
                    name="role" 
                    value={r}
                    checked={formData.role === r}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="accent-[#4F7CFF] w-4 h-4"
                  />
                  <span className="text-sm">{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Account Status</label>
            <div className="flex items-center gap-4 bg-[#0B0D10] p-3 rounded-md border border-white/5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="status" 
                  value="Active"
                  checked={formData.status === 'Active'}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="accent-[#4F7CFF]"
                /> Active
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="status" 
                  value="Inactive"
                  checked={formData.status === 'Inactive'}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="accent-gray-500"
                /> Inactive
              </label>
            </div>
          </div>

          {!isEdit && (
            <div className="bg-[#4F7CFF]/10 border border-[#4F7CFF]/20 p-4 rounded-md">
              <h4 className="text-sm font-medium text-[#4F7CFF] mb-1">Temporary Password</h4>
              <p className="text-xs text-blue-200/70 mb-2">A secure password will be generated and emailed to the user upon creation.</p>
              <div className="text-lg font-mono text-white tracking-widest bg-black/30 p-2 text-center rounded border border-blue-500/30">
                ••••••••
              </div>
            </div>
          )}

        </form>
        <p className="mt-6 text-xs text-gray-500 text-center">Email/password auth. Role determines screen access.</p>
      </div>

      <div className="p-6 border-t border-white/10 bg-[#0B0D10] flex gap-3 justify-end">
        <Button onClick={onClose} className="px-4 py-2 rounded bg-transparent border border-white/20 hover:bg-white/5 text-white">
          Cancel
        </Button>
        <Button type="submit" form="user-form" className="px-4 py-2 rounded bg-[#4F7CFF] hover:bg-[#3B66E5] text-white">
          {isEdit ? 'Save Access' : 'Create User'}
        </Button>
      </div>
    </div>
  );
};
