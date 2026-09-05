import React from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useCreateEmployee } from '@/hooks/useEmployees';
import toast from 'react-hot-toast';

export default function CreateEmployeeModal({ isOpen, onClose }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const createEmployee = useCreateEmployee();

  const onSubmit = async (data) => {
    try {
      await createEmployee.mutateAsync(data);
      toast.success('Employee created successfully!');
      reset();
      onClose();
    } catch (error) {
      toast.error('Failed to create employee');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Employee Registration" className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Full Legal Name *
            </label>
            <Input 
              placeholder="e.g. Eleanor Vance"
              {...register('name', { required: 'Name is required' })} 
              error={errors.name?.message}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Work Email Address *
            </label>
            <Input 
              type="email" 
              placeholder="name@company.com"
              {...register('workEmail', { required: 'Email is required' })} 
              error={errors.workEmail?.message}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Phone Number
            </label>
            <Input 
              placeholder="+91 98765 43210"
              {...register('phone')} 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Department *
            </label>
            <Select {...register('department', { required: true })}>
              <option value="">Select Department</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Job Position / Title *
            </label>
            <Select {...register('jobPosition', { required: true })}>
              <option value="">Select Position</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Senior Software Engineer">Senior Software Engineer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="HR Specialist">HR Specialist</option>
              <option value="Sales Rep">Sales Rep</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Employment Type
            </label>
            <Select {...register('employeeType')}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Working Schedule
            </label>
            <Select {...register('workingSchedule')}>
              <option value="Standard 40h">Standard 40h</option>
              <option value="Flexible">Flexible</option>
              <option value="Night Shift">Night Shift</option>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-6 pt-5 border-t border-border-subtle">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            size="sm"
            isLoading={createEmployee.isLoading}
            className="shadow-sm"
          >
            Create Employee Record
          </Button>
        </div>
      </form>
    </Modal>
  );
}
