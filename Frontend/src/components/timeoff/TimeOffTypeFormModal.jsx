import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '@/components/ui';
import { useCreateTimeOffType, useUpdateTimeOffType } from '@/hooks/useTimeOff';
import { toast } from 'react-hot-toast';

export default function TimeOffTypeFormModal({ type, onClose }) {
  const isEdit = !!type;
  const createMutation = useCreateTimeOffType();
  const updateMutation = useUpdateTimeOffType();
  
  const [formData, setFormData] = useState({
    name: '',
    unit: 'Days',
    allocationRequired: true,
    approvalRequired: true,
    payrollIntegration: false,
    policyNotes: ''
  });

  useEffect(() => {
    if (type) {
      setFormData({
        name: type.name || '',
        unit: type.unit || 'Days',
        allocationRequired: type.allocationRequired ?? true,
        approvalRequired: type.approvalRequired ?? true,
        payrollIntegration: type.payrollIntegration ?? false,
        policyNotes: type.policyNotes || ''
      });
    }
  }, [type]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Policy name is required');
      return;
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: type.id, ...formData });
        toast.success(`Leave policy updated successfully`);
      } else {
        await createMutation.mutateAsync(formData);
        toast.success(`Leave policy created successfully`);
      }
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to save leave policy');
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={isEdit ? "Edit Time Off Type" : "New Time Off Type"}>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="space-y-2">
          <label htmlFor="name">Type Name</label>
          <Input 
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Annual Leave, Sick Leave"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="unit">Unit</label>
          <Select 
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
          >
            <option value="Days">Days</option>
            <option value="Hours">Hours</option>
          </Select>
        </div>

        <div className="space-y-4 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200/80 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Allocation Required</label>
              <p className="text-xs text-slate-500 dark:text-slate-400">Employees need an active balance to request this leave.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="allocationRequired" checked={formData.allocationRequired} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F7CFF]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Approval Required</label>
              <p className="text-xs text-slate-500 dark:text-slate-400">Requests must be approved by HR or Manager.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="approvalRequired" checked={formData.approvalRequired} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F7CFF]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Payroll Integration</label>
              <p className="text-xs text-slate-500 dark:text-slate-400">Syncs with payrun for unpaid leaves or special rules.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="payrollIntegration" checked={formData.payrollIntegration} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F7CFF]"></div>
            </label>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="policyNotes" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Policy Notes
          </label>
          <textarea
            id="policyNotes"
            name="policyNotes"
            value={formData.policyNotes}
            onChange={handleChange}
            className="w-full bg-white dark:bg-[#0B0D10] border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accent-blue min-h-[80px] placeholder:text-slate-400"
            placeholder="Describe rules, limits, or instructions for employees..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Type</Button>
        </div>
      </form>
    </Modal>
  );
}
