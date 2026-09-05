import React, { useState, useEffect } from 'react';
import { Card, Button, StatusPill } from '@/components/ui';
import { useCheckin, useCheckout } from '@/hooks/useAttendance';
import { format, differenceInMinutes } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function CheckInWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState('idle'); // idle, checked-in, checked-out
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);

  const checkinMutation = useCheckin();
  const checkoutMutation = useCheckout();

  const scheduleStart = new Date();
  scheduleStart.setHours(9, 0, 0, 0); // 9:00 AM expected start
  
  const scheduleEnd = new Date();
  scheduleEnd.setHours(17, 0, 0, 0); // 5:00 PM expected end

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    try {
      const now = new Date();
      await checkinMutation.mutateAsync({ time: now });
      setCheckInTime(now);
      setStatus('checked-in');
      
      const isLate = differenceInMinutes(now, scheduleStart) > 30;
      toast.success(`Checked in successfully${isLate ? ' (Late)' : ''}!`);
    } catch (error) {
      toast.error('Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      const now = new Date();
      await checkoutMutation.mutateAsync({ time: now });
      setCheckOutTime(now);
      setStatus('checked-out');
      toast.success('Checked out successfully!');
    } catch (error) {
      toast.error('Failed to check out');
    }
  };

  const getWorkedTime = () => {
    if (!checkInTime || !checkOutTime) return '';
    const diffMs = checkOutTime - checkInTime;
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m`;
  };

  return (
    <Card className="bg-[#161B22] border-[rgba(255,255,255,0.08)] p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Live Attendance</h2>
          <p className="text-gray-400">{format(currentTime, 'EEEE, MMMM do, yyyy')}</p>
          <div className="mt-2 text-3xl font-mono text-white">
            {format(currentTime, 'hh:mm:ss a')}
          </div>
          <p className="text-sm text-gray-500 mt-1">Expected work window: 09:00 AM - 05:00 PM</p>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-3">
          {status === 'idle' && (
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white min-w-[200px]"
              onClick={handleCheckIn}
              isLoading={checkinMutation.isLoading}
            >
              CHECK IN
            </Button>
          )}

          {status === 'checked-in' && (
            <>
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white min-w-[200px]"
                onClick={handleCheckOut}
                isLoading={checkoutMutation.isLoading}
              >
                CHECK OUT
              </Button>
              <div className="text-sm text-gray-300">
                Checked in at {format(checkInTime, 'hh:mm a')}
                {differenceInMinutes(checkInTime, scheduleStart) > 30 && (
                  <StatusPill variant="warning" className="ml-2">Late</StatusPill>
                )}
              </div>
            </>
          )}

          {status === 'checked-out' && (
            <div className="text-center sm:text-right">
              <div className="text-green-400 font-medium mb-1">Shift Completed</div>
              <div className="text-sm text-gray-300">
                Checked in at {format(checkInTime, 'hh:mm a')}
              </div>
              <div className="text-sm text-gray-300">
                Checked out at {format(checkOutTime, 'hh:mm a')} | Worked: {getWorkedTime()}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
