import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useEmployees } from '@/hooks/useEmployees';
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers';
import toast from 'react-hot-toast';

export const CreateEditUserPanel = ({ user, onClose }) => {
  const isEdit = !!user;
  
  const { data: employees = [] } = useEmployees({});
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'EMPLOYEE',
    status: 'Active'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        employeeId: user.employee_id || user.linkedEmployeeId || '',
        email: user.email || '',
        firstName: user.first_name || (user.name ? user.name.split(' ')[0] : ''),
        lastName: user.last_name || (user.name ? user.name.split(' ').slice(1).join(' ') : ''),
        role: (user.role || 'EMPLOYEE').toUpperCase(),
        status: user.status === 'Inactive' ? 'Inactive' : 'Active'
      });
    }
  }, [user]);

  const roles = [
    { id: 'ADMIN', label: 'Administrator', desc: 'Full access to user administration, configuration, and all modules' },
    { id: 'HR', label: 'HR Manager', desc: 'Full payroll, contracts, leave, attendance, and employee management' },
    { id: 'MANAGER', label: 'Department Manager', desc: 'Team oversight, time-off approvals for direct reports, attendance' },
    { id: 'AUDITOR', label: 'Auditor (Read-Only)', desc: 'Enterprise inspection of payroll, contracts, and attendance without mutations' },
    { id: 'EMPLOYEE', label: 'Employee (Self-Service)', desc: 'Strictly restricted to own attendance, leave requests, and personal payslips' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateUser.mutateAsync({
          id: user.id,
          data: {
            role: formData.role,
            is_active: formData.status === 'Active',
            employee_id: formData.employeeId || null,
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        });
        toast.success('User privileges updated successfully');
      } else {
        await createUser.mutateAsync({
          email: formData.email,
          role: formData.role,
          first_name: formData.firstName || formData.email.split('@')[0],
          last_name: formData.lastName || 'User',
          password: 'Password@123',
        });
        toast.success('New system user created successfully (Temporary password: Password@123)');
      }
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save user access';
      toast.error(msg);
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface-1 text-text-main border-l border-border-medium">
      <div className="flex justify-between items-center p-6 border-b border-border-subtle bg-surface-2">
        <div>
          <h2 className="text-base font-bold text-text-main">{isEdit ? 'Configure User Privileges' : 'Create System User'}</h2>
          <p className="text-xs text-text-muted mt-0.5">Role-based permission assignment</p>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-text-main text-2xl leading-none">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form id="user-form" onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Linked Employee Profile
            </label>
            <select 
              className="w-full bg-surface-2 border border-border-subtle rounded-xl p-2.5 text-xs text-text-main outline-none focus:border-accent-blue"
              value={formData.employeeId}
              onChange={e => {
                const empId = e.target.value;
                const emp = employees.find(x => x.id === empId);
                setFormData(prev => ({
                  ...prev,
                  employeeId: empId,
                  email: emp ? (emp.workEmail || emp.email || prev.email) : prev.email,
                  firstName: emp ? (emp.first_name || emp.name?.split(' ')[0] || prev.firstName) : prev.firstName,
                  lastName: emp ? (emp.last_name || emp.name?.split(' ').slice(1).join(' ') || prev.lastName) : prev.lastName,
                }));
              }}
            >
              <option value="">-- No Employee Profile (System Account Only) --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()} ({emp.employee_code || emp.employeeId || 'EMP'}) · {emp.department || 'General'}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-text-muted mt-1">Binds this login to an employee record for self-service portal restrictions.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                First Name
              </label>
              <input 
                type="text" 
                className="w-full bg-surface-2 border border-border-subtle rounded-xl p-2.5 text-xs text-text-main outline-none focus:border-accent-blue"
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                placeholder="First"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Last Name
              </label>
              <input 
                type="text" 
                className="w-full bg-surface-2 border border-border-subtle rounded-xl p-2.5 text-xs text-text-main outline-none focus:border-accent-blue"
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                placeholder="Last"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Work Email *
            </label>
            <input 
              type="email" 
              required
              disabled={isEdit}
              className={`w-full bg-surface-2 border border-border-subtle rounded-xl p-2.5 text-xs text-text-main outline-none focus:border-accent-blue ${isEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Privilege Tier (RBAC) *
            </label>
            <div className="space-y-2 bg-surface-2 p-3 rounded-xl border border-border-subtle">
              {roles.map(r => (
                <label key={r.id} className="flex items-start gap-3 cursor-pointer p-2 hover:bg-surface-3/60 rounded-lg transition-colors">
                  <input 
                    type="radio" 
                    name="role" 
                    value={r.id}
                    checked={formData.role === r.id}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="accent-accent-blue w-4 h-4 mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-semibold text-text-main block">{r.label}</span>
                    <span className="text-[10px] text-text-muted leading-tight block mt-0.5">{r.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Account Status
            </label>
            <div className="flex items-center gap-4 bg-surface-2 p-3 rounded-xl border border-border-subtle text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-accent-emerald">
                <input 
                  type="radio" 
                  name="status" 
                  value="Active"
                  checked={formData.status === 'Active'}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="accent-accent-emerald"
                /> Active
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-text-muted">
                <input 
                  type="radio" 
                  name="status" 
                  value="Inactive"
                  checked={formData.status === 'Inactive'}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="accent-text-muted"
                /> Deactivated
              </label>
            </div>
          </div>

          {!isEdit && (
            <div className="bg-accent-blue/10 border border-accent-blue/20 p-3.5 rounded-xl">
              <h4 className="text-xs font-semibold text-accent-blue mb-1">Temporary Initial Credentials</h4>
              <p className="text-[11px] text-text-secondary mb-2">New accounts are provisioned with default password <span className="font-mono font-bold text-text-main">Password@123</span>.</p>
            </div>
          )}

        </form>
      </div>

      <div className="p-4 border-t border-border-subtle bg-surface-2 flex gap-2.5 justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          form="user-form" 
          variant="primary" 
          size="sm"
          isLoading={createUser.isLoading || updateUser.isLoading}
        >
          {isEdit ? 'Save Access Privileges' : 'Provision User'}
        </Button>
      </div>
    </div>
  );
};
