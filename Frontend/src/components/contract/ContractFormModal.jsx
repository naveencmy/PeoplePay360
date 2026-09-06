import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useCreateContract, useUpdateContract } from '@/hooks/useContracts';
import { useEmployees } from '@/hooks/useEmployees';
import { useSalaryStructures } from '@/hooks/useSalary';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import { AlertCircle, IndianRupee, FileText } from 'lucide-react';

export default function ContractFormModal({ isOpen, onClose, contract, prefilledEmployeeId }) {
  const { register, handleSubmit, reset, watch, setValue, getValues, formState: { errors } } = useForm();
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  
  const { hasRole } = useAuthStore();
  const canManage = hasRole('ADMIN', 'HR');
  
  const { data: employeesData } = useEmployees({});
  const employees = Array.isArray(employeesData) ? employeesData : (Array.isArray(employeesData?.data) ? employeesData.data : []);
  
  const { data: structuresData } = useSalaryStructures();
  const structures = Array.isArray(structuresData) ? structuresData : (Array.isArray(structuresData?.data) ? structuresData.data : []);

  // Ensure the contract's assigned employee is always present even if archived or still loading
  const allEmployees = React.useMemo(() => {
    const list = [...employees];
    if (contract && (contract.employee_id || contract.employeeId)) {
      const cEmpId = contract.employee_id || contract.employeeId;
      if (!list.some(e => e.id === cEmpId)) {
        const cEmpName = contract.employeeName || `${contract.first_name || ''} ${contract.last_name || ''}`.trim() || 'Assigned Employee';
        list.unshift({
          id: cEmpId,
          name: cEmpName,
          department: contract.department || 'Staff',
          jobPosition: contract.job_title || contract.jobPosition || 'Employee',
          employee_code: contract.employee_code || '',
        });
      }
    }
    return list;
  }, [employees, contract]);

  // Ensure the contract's salary structure is always present
  const allStructures = React.useMemo(() => {
    const list = [...structures];
    if (contract && (contract.structure_id || contract.salaryStructureId)) {
      const sId = contract.structure_id || contract.salaryStructureId;
      if (!list.some(s => s.id === sId)) {
        list.unshift({
          id: sId,
          name: contract.structure_name || contract.salaryStructure || 'Assigned Salary Structure',
        });
      }
    }
    return list;
  }, [structures, contract]);

  const [conflictWarning, setConflictWarning] = useState(false);

  const selectedEmployeeId = watch('employeeId');
  const selectedStatus = watch('status');

  useEffect(() => {
    if (!isOpen) return;

    const toDateInput = (val) => {
      if (!val) return '';
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return String(val).substring(0, 10);
        return d.toISOString().split('T')[0];
      } catch {
        return String(val).substring(0, 10);
      }
    };

    if (contract) {
      const empId = contract.employee_id || contract.employeeId || '';
      const structId = contract.structure_id || contract.salaryStructureId || '';
      const matchedStruct = allStructures.find(s => s.id === structId || s.name === contract.salaryStructure);
      const matchedEmp = allEmployees.find(e => e.id === empId);

      reset({
        name: contract.name || contract.reference || 'Employment Contract',
        employeeId: empId,
        department: contract.department || matchedEmp?.department || '',
        jobPosition: contract.job_title || contract.jobPosition || matchedEmp?.jobPosition || matchedEmp?.designation || '',
        startDate: toDateInput(contract.date_start || contract.startDate),
        endDate: toDateInput(contract.date_end || contract.endDate),
        wage: contract.wage !== undefined ? parseFloat(contract.wage) : '',
        salaryStructure: matchedStruct?.id || structId || allStructures[0]?.id || '',
        status: (contract.state || contract.status || 'ACTIVE').toUpperCase(),
      });
    } else {
      const defaultEmp = allEmployees.find(e => e.id === prefilledEmployeeId);
      reset({
        name: '',
        employeeId: prefilledEmployeeId || '',
        department: defaultEmp?.department || '',
        jobPosition: defaultEmp?.jobPosition || defaultEmp?.designation || '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        wage: 50000,
        salaryStructure: allStructures[0]?.id || '',
        status: 'ACTIVE',
      });
    }
  }, [isOpen, contract?.id, prefilledEmployeeId, allStructures.length, allEmployees.length, reset]);

  useEffect(() => {
    if (selectedEmployeeId && allEmployees.length > 0) {
      const emp = allEmployees.find(e => e.id === selectedEmployeeId);
      if (emp) {
        setValue('department', emp.department || 'General');
        setValue('jobPosition', emp.jobPosition || emp.designation || 'Employee');
      }
    }
  }, [selectedEmployeeId, allEmployees, setValue]);

  // Conflict check simulation
  useEffect(() => {
    if (selectedStatus === 'ACTIVE' && selectedEmployeeId && !contract) {
      setConflictWarning(false);
    } else {
      setConflictWarning(false);
    }
  }, [selectedStatus, selectedEmployeeId, contract]);

  useEffect(() => {
    if (!contract && isOpen) {
      if (allStructures.length > 0 && !getValues('salaryStructure')) {
        setValue('salaryStructure', allStructures[0].id);
      }
      if (allEmployees.length > 0 && !getValues('employeeId')) {
        const emp = allEmployees.find(e => e.id === prefilledEmployeeId) || allEmployees[0];
        setValue('employeeId', emp.id);
        setValue('department', emp.department || 'General');
        setValue('jobPosition', emp.jobPosition || emp.designation || 'Employee');
      }
    }
  }, [isOpen, allStructures, allEmployees, contract, prefilledEmployeeId, setValue, getValues]);

  const onSubmit = async (formData) => {
    try {
      const empId = formData.employeeId || contract?.employee_id || contract?.employeeId || prefilledEmployeeId || allEmployees[0]?.id;
      const structId = formData.salaryStructure || allStructures[0]?.id;

      if (!empId) {
        toast.error('Please select an employee');
        return;
      }
      if (!structId) {
        toast.error('Please select a salary structure');
        return;
      }

      const payload = {
        name: formData.name || 'Employment Contract',
        employee_id: empId,
        structure_id: structId,
        wage: parseFloat(formData.wage) || 50000,
        date_start: formData.startDate || new Date().toISOString().split('T')[0],
        date_end: formData.endDate ? formData.endDate : null,
        state: (formData.status || 'ACTIVE').toUpperCase(),
        department: formData.department || 'General',
        job_title: formData.jobPosition || 'Employee',
      };

      if (contract) {
        await updateContract.mutateAsync({ id: contract.id, data: payload });
        toast.success('Contract updated successfully');
      } else {
        await createContract.mutateAsync(payload);
        toast.success('Contract created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Contract save error:', error?.response?.data || error);
      const errMsg = error?.response?.data?.message || (error?.response?.data?.errors ? error.response.data.errors.join(', ') : error?.message);
      toast.error(errMsg || 'Failed to save contract');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={contract ? "Edit Employment Contract" : "New Employment Contract"} 
      subtitle="Define legal terms, compensation scale, and statutory salary structure"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {conflictWarning && (
          <div className="bg-accent-amber/10 border border-accent-amber/30 text-accent-amber p-3.5 rounded-xl flex items-start gap-3 text-xs">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>Another active contract already exists for this employee. Creating another active contract will supersede earlier terms.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Assigned Employee *
            </label>
            <Select 
              {...register('employeeId', { required: 'Employee is required' })}
              value={selectedEmployeeId || contract?.employee_id || contract?.employeeId || ''}
              onChange={(e) => {
                setValue('employeeId', e.target.value);
                const emp = allEmployees.find(item => item.id === e.target.value);
                if (emp) {
                  setValue('department', emp.department || 'General');
                  setValue('jobPosition', emp.jobPosition || emp.designation || 'Employee');
                }
              }}
            >
              <option value="">Select Employee...</option>
              {allEmployees?.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()} · {emp.department || 'Staff'} {emp.employee_code ? `(${emp.employee_code})` : ''}
                </option>
              ))}
            </Select>
            {errors.employeeId && <span className="text-accent-rose text-xs mt-1 block">{errors.employeeId.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Department
            </label>
            <Input {...register('department')} readOnly placeholder="Auto-populated from employee" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Job Position
            </label>
            <Input {...register('jobPosition')} readOnly placeholder="Auto-populated from employee" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Start Date *
            </label>
            <Input type="date" {...register('startDate', { required: 'Start date is required' })} />
            {errors.startDate && <span className="text-accent-rose text-xs mt-1 block">{errors.startDate.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              End Date
            </label>
            <Input type="date" {...register('endDate')} placeholder="Ongoing (Indefinite)" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Base Wage (INR) *
            </label>
            <Input 
              type="number" 
              leadingIcon={<IndianRupee className="w-4 h-4 text-accent-blue" />}
              placeholder="e.g. 85000"
              {...register('wage', { required: 'Base wage is required', valueAsNumber: true })} 
            />
            {errors.wage && <span className="text-accent-rose text-xs mt-1 block">{errors.wage.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Salary Structure *
            </label>
            <Select {...register('salaryStructure', { required: 'Salary structure is required' })}>
              {structures && structures.length > 0 ? (
                structures.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
              ) : (
                <option value="">No structures found</option>
              )}
            </Select>
            {errors.salaryStructure && <span className="text-accent-rose text-xs mt-1 block">{errors.salaryStructure.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Contract Lifecycle Status
            </label>
            <Select {...register('status')}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {canManage ? 'Cancel' : 'Close'}
          </Button>
          {canManage && (
            <Button 
              type="submit" 
              variant="primary" 
              size="sm"
              className="gap-2 shadow-sm font-semibold"
              isLoading={createContract.isPending || updateContract.isPending}
            >
              <FileText className="w-4 h-4" />
              <span>{contract ? 'Save Contract' : 'Create Contract'}</span>
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
