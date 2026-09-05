import React, { useState } from 'react';
import { useDashboardKPIs, useDashboardCharts } from '@/hooks/useDashboard';
import PageHeader from '@/components/layout/PageHeader';
import { KPICard } from '@/components/ui/KPICard';
import { Card } from '@/components/ui/Card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#4F7CFF', '#F59E0B', '#EF4444'];

export const DashboardPage = () => {
  const [period, setPeriod] = useState('This Month');
  const [department, setDepartment] = useState('All');
  const [employeeType, setEmployeeType] = useState('All');

  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs({ period, department, employeeType });
  const { data: charts, isLoading: chartsLoading } = useDashboardCharts({ period, department, employeeType });

  return (
    <div className="p-6 bg-[#0B0D10] text-gray-100 min-h-screen">
      <PageHeader 
        title="Payroll Dashboard" 
        subtitle="Overview of payroll, attendance, and compliance metrics"
      />
      
      {/* Filter Bar */}
      <div className="flex gap-4 mb-6 bg-[#161B22] p-4 rounded-lg border border-white/10">
        <select 
          className="bg-[#0B0D10] border border-white/10 text-white rounded px-3 py-2 outline-none focus:border-[#4F7CFF]"
          value={period} onChange={e => setPeriod(e.target.value)}
        >
          <option>This Month</option>
          <option>Last Month</option>
          <option>Last 3 Months</option>
          <option>This Year</option>
        </select>
        <select 
          className="bg-[#0B0D10] border border-white/10 text-white rounded px-3 py-2 outline-none focus:border-[#4F7CFF]"
          value={department} onChange={e => setDepartment(e.target.value)}
        >
          <option>All Departments</option>
          <option>Engineering</option>
          <option>Sales</option>
          <option>Marketing</option>
        </select>
        <select 
          className="bg-[#0B0D10] border border-white/10 text-white rounded px-3 py-2 outline-none focus:border-[#4F7CFF]"
          value={employeeType} onChange={e => setEmployeeType(e.target.value)}
        >
          <option>All Types</option>
          <option>Full-time</option>
          <option>Contractor</option>
        </select>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {kpisLoading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="h-24 bg-[#161B22] animate-pulse rounded-lg border border-white/10"></div>)
        ) : (
          <>
            <KPICard title="Total Net Salary Paid" value={kpis?.totalSalary || '$0'} delta={kpis?.salaryDelta || '0%'} />
            <KPICard title="Payslips Generated" value={kpis?.payslips || '0'} subtext={`${kpis?.paidPayslips || 0} paid, ${kpis?.pendingPayslips || 0} pending`} />
            <KPICard title="Avg Salary/Employee" value={kpis?.avgSalary || '$0'} />
            <KPICard title="Approved Time Off" value={kpis?.timeOffDays || '0 days'} />
            <KPICard title="Attendance Health" value={`${kpis?.attendanceHealth || 0}%`} subtext={`${kpis?.presentDays || 0} / ${kpis?.expectedDays || 0} days`} />
          </>
        )}
      </div>

      {/* Chart Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 h-80 flex flex-col bg-[#161B22] border-white/10">
          <h3 className="text-lg font-medium mb-4">Salary Cost by Department</h3>
          {chartsLoading ? <div className="flex-1 animate-pulse bg-white/5 rounded"></div> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.salaryByDept || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#888" tickLine={false} />
                <YAxis stroke="#888" tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#161B22', borderColor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
                <Bar dataKey="value" fill="#4F7CFF" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#888', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
        
        <Card className="p-4 h-80 flex flex-col bg-[#161B22] border-white/10">
          <h3 className="text-lg font-medium mb-4">Monthly Net Salary Trend</h3>
          {chartsLoading ? <div className="flex-1 animate-pulse bg-white/5 rounded"></div> : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.salaryTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#888" tickLine={false} />
                <YAxis stroke="#888" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#161B22', borderColor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
                <Line type="monotone" dataKey="value" stroke="#4F7CFF" strokeWidth={2} dot={{ r: 4, fill: '#4F7CFF' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4 h-80 flex flex-col bg-[#161B22] border-white/10">
          <h3 className="text-lg font-medium mb-4">Payslip Status & Alerts</h3>
          {chartsLoading ? <div className="flex-1 animate-pulse bg-white/5 rounded"></div> : (
            <div className="flex flex-col h-full gap-4">
              <div className="h-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts?.payslipStatus || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="#888" hide />
                    <YAxis dataKey="status" type="category" stroke="#888" width={80} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#161B22', borderColor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
                    <Bar dataKey="count" fill="#22C55E" radius={[0, 4, 4, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Live Alerts</h4>
                <ul className="space-y-2 text-sm">
                  {charts?.alerts?.map((alert, i) => (
                    <li key={i} className="flex items-start gap-2 text-red-400">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                      <Link to={alert.link} className="hover:underline">{alert.message}</Link>
                    </li>
                  ))}
                  {(!charts?.alerts || charts.alerts.length === 0) && (
                    <li className="text-gray-500">No active alerts</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 h-64 flex flex-col bg-[#161B22] border-white/10">
          <h3 className="text-lg font-medium mb-2">Attendance Overview</h3>
          {chartsLoading ? <div className="flex-1 animate-pulse bg-white/5 rounded"></div> : (
            <div className="relative flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts?.attendancePie || []} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {(charts?.attendancePie || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', borderColor: 'rgba(255,255,255,0.08)' }} itemStyle={{color: '#fff'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white">{charts?.attendanceStats?.present || 0}</span>
                <span className="text-xs text-gray-400">Present</span>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4 h-64 overflow-y-auto bg-[#161B22] border-white/10">
          <h3 className="text-lg font-medium mb-4">Time Off Overview</h3>
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium text-right">Apprv</th>
                <th className="pb-2 font-medium text-right">Pend</th>
                <th className="pb-2 font-medium text-right">Bal</th>
              </tr>
            </thead>
            <tbody>
              {charts?.timeOff?.map((t, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className="py-2 text-gray-300">{t.type}</td>
                  <td className="py-2 text-right text-gray-300">{t.approved}</td>
                  <td className="py-2 text-right text-gray-300">{t.pending}</td>
                  <td className="py-2 text-right font-medium text-white">{t.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-4 h-64 overflow-y-auto bg-[#161B22] border-white/10">
          <h3 className="text-lg font-medium mb-4">Department Overview</h3>
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="pb-2 font-medium">Dept</th>
                <th className="pb-2 font-medium text-right">Headcount</th>
                <th className="pb-2 font-medium text-right">Salary</th>
              </tr>
            </thead>
            <tbody>
              {charts?.deptOverview?.map((d, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className="py-2 text-gray-300">{d.name}</td>
                  <td className="py-2 text-right text-gray-300">{d.headcount}</td>
                  <td className="py-2 text-right font-medium text-white">{d.salary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-4 h-64 flex flex-col bg-[#161B22] border-white/10">
          <details className="group">
            <summary className="text-lg font-medium cursor-pointer list-none flex justify-between items-center text-white">
              Data Sources
              <span className="transition group-open:rotate-180 text-gray-400">▼</span>
            </summary>
            <div className="mt-4 text-sm text-gray-400 space-y-3 bg-[#0B0D10] p-3 rounded-lg border border-white/5">
              <p><span className="text-white font-medium">Employee Records:</span> Active, Onboarding, Offboarding</p>
              <p><span className="text-white font-medium">Time & Attendance:</span> Daily logs, Biometrics</p>
              <p><span className="text-white font-medium">Leave Management:</span> Approved requests</p>
              <p><span className="text-white font-medium">Payroll Engine:</span> Processed and pending payruns</p>
            </div>
          </details>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
