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
    <Modal isOpen={isOpen} onClose={onClose} title="New Employee" className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
            <Input 
              {...register('name', { required: 'Name is required' })} 
              error={errors.name?.message}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Work Email *</label>
            <Input 
              type="email" 
              {...register('workEmail', { required: 'Email is required' })} 
              error={errors.workEmail?.message}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Phone</label>
            <Input {...register('phone')} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Department *</label>
            <Select {...register('department', { required: true })}>
              <option value="">Select Department</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Job Position *</label>
            <Select {...register('jobPosition', { required: true })}>
              <option value="">Select Position</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="HR Specialist">HR Specialist</option>
              <option value="Sales Rep">Sales Rep</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Employee Type</label>
            <Select {...register('employeeType')}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Working Schedule</label>
            <Select {...register('workingSchedule')}>
              <option value="Standard 40h">Standard 40h</option>
              <option value="Flexible">Flexible</option>
              <option value="Night Shift">Night Shift</option>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[rgba(255,255,255,0.08)]">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="bg-[#4F7CFF] hover:bg-blue-600" isLoading={createEmployee.isLoading}>
            Create Employee
          </Button>
        </div>
      </form>
    </Modal>
  );
}
