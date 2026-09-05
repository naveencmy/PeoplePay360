import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '@/components/ui';
import { toast } from 'react-hot-toast';

export default function TimeOffTypeFormModal({ type, onClose }) {
  const isEdit = !!type;
  
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // API Call Mock
    toast.success(`Time off type ${isEdit ? 'updated' : 'created'} successfully`);
    onClose();
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

        <div className="space-y-4 bg-white/5 p-4 rounded-lg border border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white">Allocation Required</label>
              <p className="text-xs text-gray-400">Employees need an active balance to request this leave.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="allocationRequired" checked={formData.allocationRequired} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F7CFF]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-white">Approval Required</label>
              <p className="text-xs text-gray-400">Requests must be approved by HR or Manager.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="approvalRequired" checked={formData.approvalRequired} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F7CFF]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-white">Payroll Integration</label>
              <p className="text-xs text-gray-400">Syncs with payrun for unpaid leaves or special rules.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="payrollIntegration" checked={formData.payrollIntegration} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F7CFF]"></div>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="policyNotes">Policy Notes</label>
          <textarea
            id="policyNotes"
            name="policyNotes"
            value={formData.policyNotes}
            onChange={handleChange}
            className="w-full bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] rounded-md p-3 text-white focus:outline-none focus:border-[#4F7CFF] min-h-[80px]"
            placeholder="Describe rules, limits, or instructions for employees..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(255,255,255,0.08)]">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Type</Button>
        </div>
      </form>
    </Modal>
  );
}
