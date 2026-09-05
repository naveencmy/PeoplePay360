import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useCreateSchedule } from '@/hooks/useSchedules';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ScheduleFormModal({ isOpen, onClose }) {
  const { register, handleSubmit, reset } = useForm();
  const createSchedule = useCreateSchedule();

  const [scheduleGrid, setScheduleGrid] = useState(
    DAYS.map(day => ({
      day,
      startTime: '09:00',
      endTime: '17:00',
      breakHours: 1,
      active: !['Saturday', 'Sunday'].includes(day)
    }))
  );

  const calculateHours = (start, end, breakHrs) => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let diff = (endH + endM / 60) - (startH + startM / 60);
    if (diff < 0) diff += 24; // Handle night shifts over midnight
    const total = diff - Number(breakHrs);
    return total > 0 ? total : 0;
  };

  const handleGridChange = (index, field, value) => {
    const newGrid = [...scheduleGrid];
    newGrid[index][field] = value;
    setScheduleGrid(newGrid);
  };

  const applyPreset = (preset) => {
    let newGrid = [...scheduleGrid];
    if (preset === '40h') {
      newGrid = DAYS.map(day => ({
        day, startTime: '09:00', endTime: '18:00', breakHours: 1, active: !['Saturday', 'Sunday'].includes(day)
      }));
    } else if (preset === 'Night') {
      newGrid = DAYS.map(day => ({
        day, startTime: '22:00', endTime: '06:00', breakHours: 1, active: !['Saturday', 'Sunday'].includes(day)
      }));
    } else if (preset === 'PartTime') {
      newGrid = DAYS.map(day => ({
        day, startTime: '09:00', endTime: '13:00', breakHours: 0, active: !['Saturday', 'Sunday'].includes(day)
      }));
    }
    setScheduleGrid(newGrid);
  };

  const totalWeeklyHours = scheduleGrid
    .filter(row => row.active)
    .reduce((sum, row) => sum + calculateHours(row.startTime, row.endTime, row.breakHours), 0);

  const onSubmit = async (data) => {
    try {
      await createSchedule.mutateAsync({
        name: data.name,
        grid: scheduleGrid.filter(row => row.active),
        totalHours: totalWeeklyHours
      });
      toast.success('Schedule created');
      onClose();
    } catch (error) {
      toast.error('Failed to create schedule');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Working Schedule" className="max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-1">Schedule Name *</label>
            <Input {...register('name', { required: true })} placeholder="e.g. Standard 40h/Week" />
          </div>
          <div className="flex gap-2 pb-1">
            <Button type="button" variant="outline" onClick={() => applyPreset('40h')} size="sm">40h/Week</Button>
            <Button type="button" variant="outline" onClick={() => applyPreset('Night')} size="sm">Night Shift</Button>
            <Button type="button" variant="outline" onClick={() => applyPreset('PartTime')} size="sm">Part-Time 20h</Button>
          </div>
        </div>

        <div className="border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden bg-black/20">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#161B22] border-b border-[rgba(255,255,255,0.08)] text-gray-400">
              <tr>
                <th className="p-3 w-12">Active</th>
                <th className="p-3">Day</th>
                <th className="p-3">Start Time</th>
                <th className="p-3">End Time</th>
                <th className="p-3">Break (hours)</th>
                <th className="p-3 text-right">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {scheduleGrid.map((row, i) => (
                <tr key={row.day} className="border-b border-[rgba(255,255,255,0.05)] last:border-0">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox" 
                      checked={row.active} 
                      onChange={(e) => handleGridChange(i, 'active', e.target.checked)}
                      className="rounded bg-black border-[rgba(255,255,255,0.2)]"
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-300">{row.day}</td>
                  <td className="p-3">
                    <Input 
                      type="time" 
                      value={row.startTime} 
                      onChange={(e) => handleGridChange(i, 'startTime', e.target.value)}
                      disabled={!row.active}
                      className="h-8 py-1"
                    />
                  </td>
                  <td className="p-3">
                    <Input 
                      type="time" 
                      value={row.endTime} 
                      onChange={(e) => handleGridChange(i, 'endTime', e.target.value)}
                      disabled={!row.active}
                      className="h-8 py-1"
                    />
                  </td>
                  <td className="p-3">
                    <Input 
                      type="number" 
                      step="0.5" 
                      min="0"
                      value={row.breakHours} 
                      onChange={(e) => handleGridChange(i, 'breakHours', e.target.value)}
                      disabled={!row.active}
                      className="h-8 py-1 w-24"
                    />
                  </td>
                  <td className="p-3 text-right font-medium text-[#4F7CFF]">
                    {row.active ? calculateHours(row.startTime, row.endTime, row.breakHours).toFixed(1) : '0.0'}h
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#161B22] border-t border-[rgba(255,255,255,0.08)]">
              <tr>
                <td colSpan="5" className="p-4 text-right font-semibold text-gray-300">Total Weekly Hours:</td>
                <td className="p-4 text-right font-bold text-[#4F7CFF] text-lg">{totalWeeklyHours.toFixed(1)}h</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="bg-[#4F7CFF] hover:bg-blue-600" isLoading={createSchedule.isLoading}>
            Create Schedule
          </Button>
        </div>
      </form>
    </Modal>
  );
}
