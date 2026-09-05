import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const MySpacePage = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const employeeName = "Alex";
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="p-6 bg-[#0B0D10] text-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">My Space</h1>
          <p className="text-lg text-gray-400 mt-1">Hello, {employeeName} • <span className="text-[#4F7CFF]">{today}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* My Attendance */}
          <Card className="bg-[#161B22] border-white/10 p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              ⏱️ My Attendance
            </h2>
            
            <div className="flex flex-col items-center justify-center py-6 border-b border-white/10 mb-6">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 mb-4 transition-colors ${isCheckedIn ? 'border-green-500 bg-green-500/10' : 'border-gray-600 bg-gray-800'}`}>
                <span className="text-2xl font-mono font-bold">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <Button 
                onClick={() => setIsCheckedIn(!isCheckedIn)}
                className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${isCheckedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-[#4F7CFF] hover:bg-[#3B66E5]'}`}
              >
                {isCheckedIn ? 'Check Out' : 'Check In'}
              </Button>
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Recent Logs</h3>
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex justify-between items-center text-sm bg-[#0B0D10] p-3 rounded border border-white/5">
                    <span className="text-gray-300">Oct {15 - i}</span>
                    <span className="text-green-400">09:00 AM</span>
                    <span className="text-gray-500">-</span>
                    <span className="text-red-400">05:30 PM</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* My Leave */}
          <Card className="bg-[#161B22] border-white/10 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">🌴 My Leave</h2>
              <Button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-sm transition-colors">
                + Request Time Off
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#0B0D10] p-4 rounded-lg border border-white/5 text-center">
                <div className="text-3xl font-bold text-[#4F7CFF] mb-1">12</div>
                <div className="text-xs text-gray-400">Annual Leave Bal</div>
              </div>
              <div className="bg-[#0B0D10] p-4 rounded-lg border border-white/5 text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">5</div>
                <div className="text-xs text-gray-400">Sick Leave Bal</div>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Recent Requests</h3>
              <div className="space-y-3">
                <div className="bg-[#0B0D10] p-3 rounded border border-white/5">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-sm">Annual Leave</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">Pending</span>
                  </div>
                  <div className="text-xs text-gray-400">Oct 20 - Oct 22 (3 days)</div>
                </div>
                <div className="bg-[#0B0D10] p-3 rounded border border-white/5">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-sm">Sick Leave</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Approved</span>
                  </div>
                  <div className="text-xs text-gray-400">Sep 10 (1 day)</div>
                </div>
              </div>
            </div>
          </Card>

          {/* My Profile */}
          <Card className="bg-[#161B22] border-white/10 p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">👤 My Profile</h2>
            
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#4F7CFF] to-purple-500 flex items-center justify-center text-3xl font-bold shadow-lg mb-4">
                A
              </div>
              <h3 className="text-lg font-bold text-white">Alex Developer</h3>
              <p className="text-[#4F7CFF] text-sm">Senior Frontend Engineer</p>
              <p className="text-gray-400 text-sm mt-1">Engineering Dept</p>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Work Email</label>
                <div className="text-sm text-gray-300">alex@company.com</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Phone</label>
                <div className="text-sm text-gray-300">+1 (555) 123-4567</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Emergency Contact</label>
                <div className="text-sm text-gray-300">Jane Doe (Spouse) - 555-9876</div>
              </div>
            </div>

            <Button className="w-full bg-transparent border border-white/20 hover:bg-white/5 text-white py-2 rounded transition-colors">
              Edit Profile
            </Button>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default MySpacePage;
