import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, Calendar, Save, Edit3 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployees';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Tabs from '@/components/ui/Tabs';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: employee, isLoading, isError } = useEmployee(id);
  const updateEmployee = useUpdateEmployee();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (employee) {
      reset(employee);
    }
  }, [employee, reset]);

  const onSubmit = async (data) => {
    await updateEmployee.mutateAsync({ id, ...data });
    setIsEditing(false);
  };

  if (isLoading) return <div className="p-6 text-gray-400">Loading...</div>;
  if (isError || !employee) return <div className="p-6 text-red-400">Employee not found.</div>;

  return (
    <div className="p-6 h-full overflow-y-auto bg-[#0B0D10] text-gray-100">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/employees')} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition">
          <ArrowLeft size={20} />
        </button>
        <PageHeader 
          title={employee.name} 
          subtitle={`${employee.jobPosition} · ${employee.department}`}
          className="mb-0"
        />
        
        <div className="ml-auto flex items-center gap-3">
          <Link to={`/time-off?employee_id=${id}`}>
            <Button variant="outline" className="border-[rgba(255,255,255,0.08)] bg-[#161B22]">
              <Clock size={16} className="mr-2" /> Time Off {employee.timeOffCount ? `(${employee.timeOffCount})` : ''}
            </Button>
          </Link>
          <Link to={`/contracts?employee_id=${id}`}>
            <Button variant="outline" className="border-[rgba(255,255,255,0.08)] bg-[#161B22]">
              <FileText size={16} className="mr-2" /> Contracts {employee.contractsCount ? `(${employee.contractsCount})` : ''}
            </Button>
          </Link>
          <Link to={`/attendance?employee_id=${id}`}>
            <Button variant="outline" className="border-[rgba(255,255,255,0.08)] bg-[#161B22]">
              <Calendar size={16} className="mr-2" /> Attendance
            </Button>
          </Link>
          
          <div className="w-px h-8 bg-[rgba(255,255,255,0.1)] mx-2"></div>
          
          {isEditing ? (
            <Button onClick={handleSubmit(onSubmit)} className="bg-[#4F7CFF] hover:bg-blue-600" isLoading={updateEmployee.isLoading}>
              <Save size={16} className="mr-2" /> Save
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-[#161B22] border-[rgba(255,255,255,0.08)]">
              <Edit3 size={16} className="mr-2" /> Edit
            </Button>
          )}
        </div>
      </div>

      <div className="bg-[#161B22] rounded-xl border border-[rgba(255,255,255,0.08)] p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs 
            tabs={[
              {
                id: 'work', label: 'Work Information',
                content: (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6 mt-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Employee ID</label>
                      <Input {...register('employeeId')} readOnly className="bg-black/20" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                      <Input {...register('name', { required: true })} readOnly={!isEditing} className={!isEditing ? "bg-black/20" : ""} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Work Email</label>
                      <Input type="email" {...register('workEmail')} readOnly={!isEditing} className={!isEditing ? "bg-black/20" : ""} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Phone</label>
                      <Input {...register('phone')} readOnly={!isEditing} className={!isEditing ? "bg-black/20" : ""} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Department</label>
                      <Select {...register('department')} disabled={!isEditing} className={!isEditing ? "bg-black/20 opacity-80" : ""}>
                        <option value="Engineering">Engineering</option>
                        <option value="HR">HR</option>
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Job Position</label>
                      <Select {...register('jobPosition')} disabled={!isEditing} className={!isEditing ? "bg-black/20 opacity-80" : ""}>
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="HR Specialist">HR Specialist</option>
                        <option value="Sales Rep">Sales Rep</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Employee Type</label>
                      <Select {...register('employeeType')} disabled={!isEditing} className={!isEditing ? "bg-black/20 opacity-80" : ""}>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Working Schedule</label>
                      <Select {...register('workingSchedule')} disabled={!isEditing} className={!isEditing ? "bg-black/20 opacity-80" : ""}>
                        <option value="Standard 40h">Standard 40h</option>
                        <option value="Flexible">Flexible</option>
                        <option value="Night Shift">Night Shift</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Work Location</label>
                      <Input {...register('workLocation')} readOnly={!isEditing} className={!isEditing ? "bg-black/20" : ""} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Status</label>
                      <Select {...register('status')} disabled={!isEditing} className={!isEditing ? "bg-black/20 opacity-80" : ""}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </Select>
                    </div>
                  </div>
                )
              },
              {
                id: 'private', label: 'Private Information',
                content: (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6 mt-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Personal Email</label>
                      <Input type="email" {...register('personalEmail')} readOnly={!isEditing} className={!isEditing ? "bg-black/20" : ""} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Date of Birth</label>
                      <Input type="date" {...register('dateOfBirth')} readOnly={!isEditing} className={!isEditing ? "bg-black/20" : ""} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-400 mb-1">Address</label>
                      <Input {...register('address')} readOnly={!isEditing} className={!isEditing ? "bg-black/20" : ""} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">City</label>
                      <Input {...register('city')} readOnly={!isEditing} className={!isEditing ? "bg-black/20" : ""} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">PAN Number</label>
                      <Input {...register('panNumber')} readOnly={!isEditing} className={!isEditing ? "bg-black/20" : ""} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Bank Account Number</label>
                      <Input {...register('bankAccountNumber')} readOnly={!isEditing} className={!isEditing ? "bg-black/20" : ""} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">IFSC Code</label>
                      <Input {...register('ifscCode')} readOnly={!isEditing} className={!isEditing ? "bg-black/20" : ""} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Emergency Contact Name</label>
                      <Input {...register('emergencyContactName')} readOnly={!isEditing} className={!isEditing ? "bg-black/20" : ""} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Emergency Contact Phone</label>
                      <Input {...register('emergencyContactPhone')} readOnly={!isEditing} className={!isEditing ? "bg-black/20" : ""} />
                    </div>
                  </div>
                )
              }
            ]}
          />
        </form>
      </div>
    </div>
  );
}
