import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, AvatarBadge } from '@/components/ui';
import { useApproveLeave, useRejectLeave, useTimeOffTypes } from '@/hooks/useTimeOff';
import { differenceInBusinessDays, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function LeaveRequestModal({ request, onClose }) {
  const isViewMode = !!request;
  const { data: types } = useTimeOffTypes();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();
  
  const [formData, setFormData] = useState({
    employeeId: '',
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
        employeeId: request.employeeId,
        typeId: request.typeId || '',
        fromDate: request.fromDate,
        toDate: request.toDate,
        reason: request.reason || ''
      });
    }
  }, [request]);

  const duration = (formData.fromDate && formData.toDate) 
    ? differenceInBusinessDays(parseISO(formData.toDate), parseISO(formData.fromDate)) + 1 
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate create request
    toast.success('Leave request submitted successfully');
    onClose();
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

  // Assume user role check here, showing mock logic
  const isHrManager = true; 

  return (
    <Modal isOpen={true} onClose={onClose} title={isViewMode ? "Leave Request Detail" : "Request Time Off"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {isViewMode && (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-[rgba(255,255,255,0.08)]">
            <AvatarBadge src={request?.employeeAvatar} size="md" />
            <div>
              <div className="text-white font-medium">{request?.employeeName}</div>
              <div className="text-sm text-gray-400">Status: <span className="text-white">{request?.status}</span></div>
            </div>
          </div>
        )}

        {!isViewMode && isHrManager && (
          <div className="space-y-2">
            <label>Employee</label>
            <Select 
              value={formData.employeeId} 
              onChange={e => setFormData({...formData, employeeId: e.target.value})}
              required
            >
              <option value="">Select Employee...</option>
              <option value="1">John Doe</option>
              <option value="2">Jane Smith</option>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <label>Leave Type</label>
          <Select 
            value={formData.typeId} 
            onChange={e => setFormData({...formData, typeId: e.target.value})}
            required
            disabled={isViewMode}
          >
            <option value="">Select Type...</option>
            {types?.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label>From Date</label>
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

        <div className="p-3 bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] rounded-md flex justify-between items-center">
          <span className="text-gray-400">Duration</span>
          <span className="text-white font-medium">{duration > 0 ? duration : 0} Days</span>
        </div>

        <div className="space-y-2">
          <label>Reason</label>
          <textarea
            value={formData.reason}
            onChange={e => setFormData({...formData, reason: e.target.value})}
            required
            disabled={isViewMode}
            className="w-full bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] rounded-md p-3 text-white focus:outline-none focus:border-[#4F7CFF] min-h-[100px]"
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

        <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(255,255,255,0.08)] mt-6">
          {!isViewMode ? (
            <>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary">Submit Request</Button>
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
              {isHrManager && request?.status === 'Pending' && (
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
