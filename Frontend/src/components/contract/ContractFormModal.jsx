import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useCreateContract, useUpdateContract } from '@/hooks/useContracts';
import { useEmployees } from '@/hooks/useEmployees';
import toast from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

export default function ContractFormModal({ isOpen, onClose, contract, prefilledEmployeeId }) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const { data: employeesData } = useEmployees({});
  const employees = Array.isArray(employeesData) ? employeesData : (Array.isArray(employeesData?.data) ? employeesData.data : []);
  const [conflictWarning, setConflictWarning] = useState(false);

  const selectedEmployeeId = watch('employeeId');
  const selectedStatus = watch('status');

  useEffect(() => {
    if (contract) {
      reset(contract);
    } else {
      reset({
        employeeId: prefilledEmployeeId || '',
        status: 'Draft'
      });
    }
  }, [contract, prefilledEmployeeId, reset]);

  useEffect(() => {
    if (selectedEmployeeId && employees) {
      const emp = employees.find(e => e.id === selectedEmployeeId);
      if (emp) {
        setValue('department', emp.department);
        setValue('jobPosition', emp.jobPosition);
      }
    }
  }, [selectedEmployeeId, employees, setValue]);

  // Dummy conflict check simulation
  useEffect(() => {
    if (selectedStatus === 'Active' && selectedEmployeeId && !contract) {
      // Simulate conflict condition
      setConflictWarning(true);
    } else {
      setConflictWarning(false);
    }
  }, [selectedStatus, selectedEmployeeId, contract]);

  const onSubmit = async (data) => {
    try {
      if (contract) {
        await updateContract.mutateAsync({ id: contract.id, ...data });
        toast.success('Contract updated');
      } else {
        await createContract.mutateAsync(data);
        toast.success('Contract created');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save contract');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={contract ? "Edit Contract" : "New Contract"} 
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        {conflictWarning && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-3 rounded-md flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm">Conflicting active contract for this employee in this period.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Employee *</label>
            <Select {...register('employeeId', { required: 'Employee is required' })} disabled={!!contract}>
              <option value="">Select Employee</option>
              {employees?.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </Select>
            {errors.employeeId && <span className="text-red-400 text-xs">{errors.employeeId.message}</span>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Department</label>
            <Input {...register('department')} readOnly className="bg-black/20" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Job Position</label>
            <Input {...register('jobPosition')} readOnly className="bg-black/20" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Start Date *</label>
            <Input type="date" {...register('startDate', { required: true })} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">End Date</label>
            <Input type="date" {...register('endDate')} placeholder="Ongoing" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Wage (INR) *</label>
            <Input type="number" {...register('wage', { required: true, valueAsNumber: true })} />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Salary Structure</label>
            <Select {...register('salaryStructure')}>
              <option value="Regular Pay">Regular Pay</option>
              <option value="Executive Pay">Executive Pay</option>
              <option value="Hourly Wage">Hourly Wage</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <Select {...register('status')}>
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[rgba(255,255,255,0.08)]">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="bg-[#4F7CFF] hover:bg-blue-600" isLoading={createContract.isLoading || updateContract.isLoading}>
            {contract ? 'Save Changes' : 'Create Contract'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
