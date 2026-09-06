import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Input, Select, AvatarBadge } from '@/components/ui';
import { useApproveLeave, useRejectLeave, useTimeOffTypes, useCreateLeaveRequest } from '@/hooks/useTimeOff';
import { useEmployees } from '@/hooks/useEmployees';
import useAuthStore from '@/store/authStore';
import { differenceInBusinessDays, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function LeaveRequestModal({ request, onClose }) {
  const isViewMode = !!request;
  const { user, hasRole } = useAuthStore();
  const isHrOrAdmin = hasRole('ADMIN', 'HR');
  const canApprove = hasRole('ADMIN', 'HR', 'MANAGER');

  const { data: types } = useTimeOffTypes();
  const { data: employeesData } = useEmployees({});
  const createMutation = useCreateLeaveRequest();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();

  const employees = useMemo(() => {
    const raw = Array.isArray(employeesData) ? employeesData : (employeesData?.data || []);
    return raw.filter(e => e && e.id);
  }, [employeesData]);
  
  const [formData, setFormData] = useState({
    employeeId: user?.employeeId || '',
    typeId: '',
    fromDate: '',
    toDate: '',
    reason: ''
  });

  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    if (request) {
      setFormData({
        employeeId: request.employeeId || request.employee_id || '',
        typeId: request.typeId || request.leave_type || '',
        fromDate: request.fromDate || request.date_from || '',
        toDate: request.toDate || request.date_to || '',
        reason: request.reason || ''
      });
    }
  }, [request]);

  useEffect(() => {
    if (!isViewMode) {
      if (!isHrOrAdmin) {
        // Enforce self-only for employees and non-HR roles
        if (user?.employeeId && formData.employeeId !== user.employeeId) {
          setFormData(prev => ({ ...prev, employeeId: user.employeeId }));
        }
      } else if (!formData.employeeId && employees.length > 0) {
        setFormData(prev => ({ ...prev, employeeId: user?.employeeId || employees[0].id }));
      }
    }
  }, [employees, formData.employeeId, isViewMode, isHrOrAdmin, user]);

  useEffect(() => {
    if (!formData.typeId && types && types.length > 0 && !isViewMode) {
      setFormData(prev => ({ ...prev, typeId: types[0].code || types[0].id }));
    }
  }, [types, formData.typeId, isViewMode]);

  const duration = (formData.fromDate && formData.toDate) 
    ? Math.max(1, differenceInBusinessDays(parseISO(formData.toDate), parseISO(formData.fromDate)) + 1)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.error('Please select an employee');
      return;
    }
    if (!formData.fromDate || !formData.toDate) {
      toast.error('Please specify start and end dates');
      return;
    }

    try {
      let rawType = formData.typeId || 'PAID_LEAVE';
      let leaveType = 'PAID_LEAVE';
      const upper = String(rawType).toUpperCase();
      if (upper.includes('CASUAL')) leaveType = 'CASUAL';
      else if (upper.includes('SICK')) leaveType = 'SICK';
      else if (upper.includes('EARN')) leaveType = 'EARNED';
      else if (upper.includes('MATERN')) leaveType = 'MATERNITY';
      else if (upper.includes('PATERN')) leaveType = 'PATERNITY';
      else if (upper.includes('UNPAID')) leaveType = 'UNPAID';
      else if (upper.includes('COMP')) leaveType = 'COMP_OFF';
      else leaveType = 'PAID_LEAVE';

      await createMutation.mutateAsync({
        employee_id: formData.employeeId,
        leave_type: leaveType,
        date_from: formData.fromDate,
        date_to: formData.toDate,
        duration: duration || 1,
        reason: formData.reason || 'Personal time off request',
      });
      toast.success('Leave request submitted successfully');
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || (err?.response?.data?.errors ? err.response.data.errors.join(', ') : err?.message);
      toast.error(msg || 'Failed to submit leave request');
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(request.id);
      toast.success('Leave request approved. Allocation balanced updated.');
      onClose();
    } catch(e) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    
    if (!rejectReason.trim()) {
      toast.error('Reason is required for refusal');
      return;
    }

    try {
      await rejectMutation.mutateAsync({ id: request.id, reason: rejectReason });
      toast.success('Leave request refused');
      onClose();
    } catch(e) {
      toast.error('Failed to refuse request');
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={isViewMode ? "Leave Request Detail" : "Request Time Off"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {isViewMode && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/10">
            <AvatarBadge src={request?.employeeAvatar} size="md" />
            <div>
              <div className="text-slate-900 dark:text-white font-semibold text-sm">{request?.employeeName}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Status: <span className="text-slate-900 dark:text-white font-medium">{request?.status}</span></div>
            </div>
          </div>
        )}

        {!isViewMode && isHrOrAdmin && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Employee *
            </label>
            <Select 
              value={formData.employeeId} 
              onChange={e => setFormData({...formData, employeeId: e.target.value})}
              required
            >
              <option value="">Select Employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()} ({emp.employee_code || emp.employeeId || 'EMP'})
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Leave Type *
          </label>
          <Select 
            value={formData.typeId} 
            onChange={e => setFormData({...formData, typeId: e.target.value})}
            required
            disabled={isViewMode}
          >
            <option value="">Select Type...</option>
            {types?.map(t => (
              <option key={t.id || t.code} value={t.code || t.id}>{t.name}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              From Date *
            </label>
            <Input 
              type="date" 
              value={formData.fromDate} 
              onChange={e => setFormData({...formData, fromDate: e.target.value})}
              required
              disabled={isViewMode}
            />
          </div>
          <div className="space-y-2">
            <label>To Date</label>
            <Input 
              type="date" 
              value={formData.toDate} 
              onChange={e => setFormData({...formData, toDate: e.target.value})}
              required
              disabled={isViewMode}
            />
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-[#0B0D10] border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Calculated Duration</span>
          <span className="text-slate-900 dark:text-white font-semibold">{duration > 0 ? duration : 0} Days</span>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">Reason</label>
          <textarea
            value={formData.reason}
            onChange={e => setFormData({...formData, reason: e.target.value})}
            required
            disabled={isViewMode}
            className="w-full bg-white dark:bg-[#0B0D10] border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accent-blue min-h-[100px] placeholder:text-slate-400"
            placeholder="Explain the reason for time off..."
          />
        </div>

        {showRejectInput && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-red-400">Refusal Reason</label>
            <Input 
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Why is this request being refused?"
              required
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
          {!isViewMode ? (
            <>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary">Submit Request</Button>
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
              {canApprove && request?.status === 'Pending' && (
                <>
                  <Button 
                    type="button" 
                    className="bg-red-600 hover:bg-red-700 text-white" 
                    onClick={handleReject}
                    isLoading={rejectMutation.isLoading}
                  >
                    {showRejectInput ? 'Confirm Refusal' : 'Refuse'}
                  </Button>
                  {!showRejectInput && (
                    <Button 
                      type="button" 
                      className="bg-green-600 hover:bg-green-700 text-white" 
                      onClick={handleApprove}
                      isLoading={approveMutation.isLoading}
                    >
                      Approve
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </form>
    </Modal>
  );
}
