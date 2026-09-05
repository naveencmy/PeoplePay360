import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { useUpdateAttendance } from '@/hooks/useAttendance';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function AttendanceDetailModal({ record, onClose }) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [auditNote, setAuditNote] = useState('');

  const updateMutation = useUpdateAttendance();

  useEffect(() => {
    if (record) {
      const getIsoDateTime = (timeVal) => {
        if (!timeVal) return '';
        if (typeof timeVal === 'string' && timeVal.includes('T')) return timeVal.slice(0, 16);
        const dateStr = record.date || new Date().toISOString().slice(0, 10);
        const t = (typeof timeVal === 'string' && timeVal.length === 5) ? timeVal : '09:00';
        return `${dateStr}T${t}`;
      };
      setCheckIn(getIsoDateTime(record.checkIn));
      setCheckOut(getIsoDateTime(record.checkOut));
    }
  }, [record]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auditNote.trim()) {
      toast.error('Audit note is required for manual corrections');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: record.id,
        checkIn: checkIn ? new Date(checkIn).toISOString() : null,
        checkOut: checkOut ? new Date(checkOut).toISOString() : null,
        auditNote,
        status: 'Manually Corrected'
      });
      toast.success('Attendance record updated');
      onClose();
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  return (
    <Modal isOpen={!!record} onClose={onClose} title="Manual Attendance Correction">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white/5 p-4 rounded-lg mb-4">
          <p className="text-white font-medium">{record.employeeName}</p>
          <p className="text-gray-400 text-sm">
            {record.date ? (() => {
              try {
                const d = new Date(record.date);
                return isNaN(d.getTime()) ? record.date : format(d, 'EEEE, MMMM do, yyyy');
              } catch {
                return record.date;
              }
            })() : ''}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="checkIn">Check In Time</label>
          <Input 
            id="checkIn" 
            type="datetime-local" 
            value={checkIn} 
            onChange={(e) => setCheckIn(e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="checkOut">Check Out Time</label>
          <Input 
            id="checkOut" 
            type="datetime-local" 
            value={checkOut} 
            onChange={(e) => setCheckOut(e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="auditNote">Audit Note (Required)</label>
          <textarea
            id="auditNote"
            value={auditNote}
            onChange={(e) => setAuditNote(e.target.value)}
            required
            className="w-full bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] rounded-md p-3 text-white focus:outline-none focus:border-[#4F7CFF] min-h-[100px]"
            placeholder="Reason for manual correction..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(255,255,255,0.08)]">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={updateMutation.isLoading}>Save Correction</Button>
        </div>
      </form>
    </Modal>
  );
}
