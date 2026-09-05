import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Clock, FileText, Calendar, Save, Edit3, User, 
  Building, Mail, Phone, MapPin, CreditCard, ShieldCheck, Wallet, 
  CheckCircle2, AlertCircle, Copy, Check, Layers
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployees';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Tabs from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import AvatarBadge from '@/components/ui/AvatarBadge';
import StatusPill from '@/components/ui/StatusPill';
import toast from 'react-hot-toast';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { data: employee, isLoading, isError } = useEmployee(id);
  const updateEmployee = useUpdateEmployee();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (employee) {
      reset(employee);
    }
  }, [employee, reset]);

  const handleCopyId = () => {
    if (employee?.employeeId) {
      navigator.clipboard.writeText(employee.employeeId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Employee ID copied to clipboard');
    }
  };

  const onSubmit = async (data) => {
    try {
      await updateEmployee.mutateAsync({ id, ...data });
      setIsEditing(false);
      toast.success('Employee details updated');
    } catch (err) {
      toast.error('Failed to update employee');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-text-muted flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
        <span className="text-xs">Loading employee dossier...</span>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="p-8 text-center text-accent-rose bg-surface-2 rounded-xl border border-accent-rose/20 m-6">
        Employee record not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Breadcrumb & PageHeader */}
      <PageHeader 
        title={employee.name} 
        subtitle={`${employee.jobPosition || 'Employee'} · ${employee.department || 'General'}`}
        breadcrumbs={[
          { label: 'Employees', to: '/employees' },
          { label: employee.name }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/employees')}
              className="gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </Button>

            {isEditing ? (
              <Button 
                onClick={handleSubmit(onSubmit)} 
                variant="primary" 
                size="sm" 
                className="gap-1.5 shadow-sm"
                isLoading={updateEmployee.isLoading}
              >
                <Save size={14} />
                <span>Save Changes</span>
              </Button>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)} 
                variant="secondary" 
                size="sm" 
                className="gap-1.5"
              >
                <Edit3 size={14} />
                <span>Edit Profile</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Hero Dossier Card */}
      <div className="rounded-2xl bg-surface-2 border border-border-subtle p-6 shadow-card relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <AvatarBadge name={employee.name} imageUrl={employee.avatarUrl} size="lg" className="w-16 h-16 text-xl" />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-text-main">{employee.name}</h2>
                <StatusPill status={employee.status || 'Active'} />
                <button 
                  onClick={handleCopyId}
                  className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-surface-3 text-text-muted hover:text-text-main border border-border-subtle transition-colors"
                  title="Copy Employee ID"
                >
                  <span>{employee.employeeId || `EMP-${employee.id}`}</span>
                  {copied ? <Check className="w-3 h-3 text-accent-emerald" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary mt-2">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-text-muted" />
                  {employee.department || 'General'}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-text-muted" />
                  {employee.workEmail || '—'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-text-muted" />
                  {employee.workLocation || 'Headquarters'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Context Action Links */}
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/time-off?employee_id=${id}`}>
              <Button variant="outline" size="sm" className="gap-1.5 bg-surface-3/50 text-xs">
                <Clock size={13} className="text-accent-amber" />
                <span>Time Off</span>
                {employee.timeOffCount ? <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-accent-amber/20 text-accent-amber text-[10px]">{employee.timeOffCount}</span> : null}
              </Button>
            </Link>
            <Link to={`/contracts?employee_id=${id}`}>
              <Button variant="outline" size="sm" className="gap-1.5 bg-surface-3/50 text-xs">
                <FileText size={13} className="text-accent-blue" />
                <span>Contracts</span>
                {employee.contractsCount ? <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-accent-blue/20 text-accent-blue text-[10px]">{employee.contractsCount}</span> : null}
              </Button>
            </Link>
            <Link to={`/attendance?employee_id=${id}`}>
              <Button variant="outline" size="sm" className="gap-1.5 bg-surface-3/50 text-xs">
                <Calendar size={13} className="text-accent-emerald" />
                <span>Attendance</span>
              </Button>
            </Link>
            <Link to={`/time-off/allocations?employee_id=${id}`}>
              <Button variant="outline" size="sm" className="gap-1.5 bg-surface-3/50 text-xs">
                <Layers size={13} className="text-accent-cyan" />
                <span>Allocations</span>
              </Button>
            </Link>
            <Link to={`/payslips?employee_id=${id}`}>
              <Button variant="outline" size="sm" className="gap-1.5 bg-surface-3/50 text-xs">
                <Wallet size={13} className="text-accent-purple" />
                <span>Payslips</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Tabs Area */}
      <div className="bg-surface-2 rounded-2xl border border-border-subtle p-6 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs 
            tabs={[
              {
                id: 'work', 
                label: 'Work Information',
                content: (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mt-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Employee ID
                      </label>
                      <Input 
                        {...register('employeeId')} 
                        readOnly 
                        className="bg-surface-3/50 cursor-not-allowed font-mono text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Full Legal Name *
                      </label>
                      <Input 
                        {...register('name', { required: true })} 
                        readOnly={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50" : "bg-surface-1"} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Corporate Work Email *
                      </label>
                      <Input 
                        type="email" 
                        {...register('workEmail')} 
                        readOnly={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50" : "bg-surface-1"} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Work Phone Number
                      </label>
                      <Input 
                        {...register('phone')} 
                        readOnly={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50" : "bg-surface-1"} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Assigned Department
                      </label>
                      <Select 
                        {...register('department')} 
                        disabled={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50 cursor-not-allowed opacity-90" : "bg-surface-1"}
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="HR">HR</option>
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Operations">Operations</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Designation / Job Position
                      </label>
                      <Select 
                        {...register('jobPosition')} 
                        disabled={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50 cursor-not-allowed opacity-90" : "bg-surface-1"}
                      >
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Senior Software Engineer">Senior Software Engineer</option>
                        <option value="Lead Engineer">Lead Engineer</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="HR Specialist">HR Specialist</option>
                        <option value="Sales Rep">Sales Rep</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Employment Category
                      </label>
                      <Select 
                        {...register('employeeType')} 
                        disabled={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50 cursor-not-allowed opacity-90" : "bg-surface-1"}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Working Schedule
                      </label>
                      <Select 
                        {...register('workingSchedule')} 
                        disabled={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50 cursor-not-allowed opacity-90" : "bg-surface-1"}
                      >
                        <option value="Standard 40h">Standard 40h (Mon - Fri)</option>
                        <option value="Flexible">Flexible (40h weekly)</option>
                        <option value="Night Shift">Night Shift</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Primary Work Location
                      </label>
                      <Input 
                        {...register('workLocation')} 
                        readOnly={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50" : "bg-surface-1"} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Status
                      </label>
                      <Select 
                        {...register('status')} 
                        disabled={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50 cursor-not-allowed opacity-90" : "bg-surface-1"}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </Select>
                    </div>
                  </div>
                )
              },
              {
                id: 'private', 
                label: 'Personal & Financial',
                content: (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mt-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Personal Email
                      </label>
                      <Input 
                        type="email" 
                        {...register('personalEmail')} 
                        readOnly={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50" : "bg-surface-1"} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Date of Birth
                      </label>
                      <Input 
                        type="date" 
                        {...register('dateOfBirth')} 
                        readOnly={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50" : "bg-surface-1"} 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Residential Address
                      </label>
                      <Input 
                        {...register('address')} 
                        readOnly={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50" : "bg-surface-1"} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        City / State
                      </label>
                      <Input 
                        {...register('city')} 
                        readOnly={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50" : "bg-surface-1"} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        PAN Card Number
                      </label>
                      <Input 
                        {...register('panNumber')} 
                        readOnly={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50 font-mono" : "bg-surface-1 font-mono uppercase"} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Salary Bank Account Number
                      </label>
                      <Input 
                        {...register('bankAccountNumber')} 
                        readOnly={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50 font-mono" : "bg-surface-1 font-mono"} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Bank IFSC Code
                      </label>
                      <Input 
                        {...register('ifscCode')} 
                        readOnly={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50 font-mono" : "bg-surface-1 font-mono uppercase"} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Emergency Contact Name
                      </label>
                      <Input 
                        {...register('emergencyContactName')} 
                        readOnly={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50" : "bg-surface-1"} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                        Emergency Contact Phone
                      </label>
                      <Input 
                        {...register('emergencyContactPhone')} 
                        readOnly={!isEditing} 
                        className={!isEditing ? "bg-surface-3/50" : "bg-surface-1"} 
                      />
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
