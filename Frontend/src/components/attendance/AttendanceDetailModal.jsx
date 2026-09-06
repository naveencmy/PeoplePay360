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
        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-4 rounded-xl mb-4">
          <p className="text-slate-900 dark:text-white font-semibold text-base">{record.employeeName}</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
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

        <div className="space-y-1.5">
          <label htmlFor="checkIn" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Check In Time
          </label>
          <Input 
            id="checkIn" 
            type="datetime-local" 
            value={checkIn} 
            onChange={(e) => setCheckIn(e.target.value)} 
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="checkOut" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Check Out Time
          </label>
          <Input 
            id="checkOut" 
            type="datetime-local" 
            value={checkOut} 
            onChange={(e) => setCheckOut(e.target.value)} 
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="auditNote" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Audit Note (Required)
          </label>
          <textarea
            id="auditNote"
            value={auditNote}
            onChange={(e) => setAuditNote(e.target.value)}
            required
            className="w-full bg-white dark:bg-[#0B0D10] border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-accent-blue min-h-[100px] placeholder:text-slate-400"
            placeholder="Reason for manual correction..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={updateMutation.isLoading}>Save Correction</Button>
        </div>
      </form>
    </Modal>
  );
}
