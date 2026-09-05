import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart 
} from 'recharts';
import { 
  WalletCards, ReceiptText, UsersRound, CalendarDays, CircleCheck, 
  ShieldCheck, ArrowRight, Download, Play, AlertCircle, RotateCcw
} from 'lucide-react';
import { useDashboardKPIs, useDashboardCharts } from '@/hooks/useDashboard';
import { useThemeStore } from '@/store/themeStore';

export default function DashboardPage() {
  const [period, setPeriod] = useState('This Month');
  const [department, setDepartment] = useState('All Departments');
  const [employeeType, setEmployeeType] = useState('All Types');
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs(period, department);
  const { data: charts, isLoading: chartsLoading } = useDashboardCharts('all', period);

  const handleResetFilters = () => {
    setPeriod('This Month');
    setDepartment('All Departments');
    setEmployeeType('All Types');
  };

  const handleExport = () => {
    const csvHeader = "Metric,Value\n";
    const csvRows = [
      `Total Net Salary,${kpis?.totalSalary || '₹0'}`,
      `Payslips Generated,${kpis?.payslips || '0'}`,
      `Avg Salary,${kpis?.avgSalary || '₹0'}`,
      `Approved Leave,${kpis?.timeOffDays || '0 days'}`,
      `Attendance Health,${kpis?.attendanceHealth || 0}%`,
    ].join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `payroll_dashboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartTheme = {
    grid: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    text: isDark ? '#94A3B8' : '#64748B',
    tooltipBg: isDark ? '#111622' : '#FFFFFF',
    tooltipBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    tooltipText: isDark ? '#F1F5F9' : '#0F172A',
  };

  // 1. Salary Cost by Department data (Horizontal Bar)
  const salaryByDeptData = charts?.salaryByDept?.length ? charts.salaryByDept.map(d => ({
    name: d.name,
    value: d.value,
    formatted: `₹${(d.value / 100000).toFixed(1)}L`
  })) : [
    { name: 'Engineering', value: 1840000, formatted: '₹18.4L' },
    { name: 'Sales', value: 710000, formatted: '₹7.1L' },
    { name: 'Product', value: 620000, formatted: '₹6.2L' },
    { name: 'Operations', value: 450000, formatted: '₹4.5L' },
  ];

  // 2. Payroll Trend 6-month data
  const payrollTrendData = charts?.salaryTrend?.length ? charts.salaryTrend.map((d, idx, arr) => {
    const prev = idx > 0 ? arr[idx - 1].value : d.value;
    const pct = prev > 0 ? (((d.value - prev) / prev) * 100).toFixed(1) : '0.0';
    return {
      month: d.month,
      value: d.value,
      formatted: `₹${(d.value / 100000).toFixed(1)}L`,
      change: `${Number(pct) >= 0 ? '+' : ''}${pct}%`
    };
  }) : [
    { month: 'Apr', value: 1120000, formatted: '₹11.2L', change: '+2.0%' },
    { month: 'May', value: 1180000, formatted: '₹11.8L', change: '+5.3%' },
    { month: 'Jun', value: 1200000, formatted: '₹12.0L', change: '+1.7%' },
    { month: 'Jul', value: 1250000, formatted: '₹12.5L', change: '+4.2%' },
    { month: 'Aug', value: 1300000, formatted: '₹13.0L', change: '+4.0%' },
    { month: 'Sep', value: 1300000, formatted: '₹13.0L', change: '0.0%' },
  ];

  // 3. Attendance Trend 7-day data (Replaces Donut)
  const attendanceTrendData = [
    { day: 'Mon', attendance: 94, late: 3 },
    { day: 'Tue', attendance: 96, late: 2 },
    { day: 'Wed', attendance: 92, late: 5 },
    { day: 'Thu', attendance: 95, late: 3 },
    { day: 'Fri', attendance: 97, late: 2 },
    { day: 'Sat', attendance: 88, late: 1 },
    { day: 'Sun', attendance: 90, late: 1 },
  ];

  // 4. Time Off data
  const timeOffData = [
    { type: 'Paid Leave', approved: 12, pending: 2, balance: 140 },
    { type: 'Sick Leave', approved: 4, pending: 1, balance: 65 },
    { type: 'Casual Leave', approved: 6, pending: 0, balance: 48 },
  ];

  // 5. Department table data
  const departmentData = [
    { name: 'Engineering', employees: 14, payroll: '₹18.4L' },
    { name: 'Product & Design', employees: 5, payroll: '₹6.2L' },
    { name: 'Sales', employees: 6, payroll: '₹7.1L' },
    { name: 'Operations', employees: 4, payroll: '₹4.5L' },
  ];

  return (
    <div className="space-y-4 pb-12 animate-fade-in max-w-[1600px] mx-auto text-slate-900 dark:text-slate-100">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Payroll Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Payroll overview and workforce metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>
          
          <Link to="/payruns">
            <button className="h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 active:scale-[0.99]">
              <Play className="w-3 h-3 fill-current" />
              <span>Run Payroll</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Payroll Health Strip (Single Horizontal Row) */}
      <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800/90 rounded-xl px-4 py-2.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-slate-600 dark:text-slate-400">Payroll Health</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">94 / 100</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Healthy
          </span>

          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

          <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            3 Attention Items
          </span>

          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

          <span className="text-slate-500 dark:text-slate-400">
            Cycle in 4 days
          </span>
        </div>

        <Link 
          to="/intelligence" 
          className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1 text-xs shrink-0 self-end sm:self-auto"
        >
          <span>View Intelligence</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 3. Compact Inline Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Period:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer text-xs"
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="Last 3 Months">Last 3 Months</option>
              <option value="This Year">This Year</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Department:</span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer text-xs"
            >
              <option value="All Departments">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Product">Product</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Type:</span>
            <select
              value={employeeType}
              onChange={(e) => setEmployeeType(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-medium outline-none cursor-pointer text-xs"
            >
              <option value="All Types">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Contractor">Contractor</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>

          {(period !== 'This Month' || department !== 'All Departments' || employeeType !== 'All Types') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 px-2 py-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. 5 KPI Cards (Compact & Simplified) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Total Net Salary */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800/90 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Total Net Salary</span>
            <WalletCards className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            {kpis?.totalSalary || '₹0'}
          </div>
          <div className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span>{kpis?.salaryDelta || 'Verified'}</span>
          </div>
        </div>

        {/* KPI 2: Payslips */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800/90 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Payslips</span>
            <ReceiptText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            {kpis?.payslips || '0'}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {kpis?.paidPayslips || 0} paid · {kpis?.pendingPayslips || 0} pending
          </div>
        </div>

        {/* KPI 3: Avg Salary */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800/90 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Avg Salary</span>
            <UsersRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            {kpis?.avgSalary || '₹0'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            Per active head
          </div>
        </div>

        {/* KPI 4: Approved Leave */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800/90 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Approved Leave</span>
            <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            {kpis?.timeOffDays || '0 days'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            This cycle
          </div>
        </div>

        {/* KPI 5: Attendance */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800/90 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Attendance</span>
            <CircleCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            {kpis?.attendanceHealth || 94}%
          </div>
          <div className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            +1.8%
          </div>
        </div>
      </div>

      {/* 5. Main Analytics Row (3 panels, compact ~270px) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Panel 1: Salary Cost by Department */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800/90 rounded-xl p-5 shadow-sm h-[270px] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Salary Cost by Department
            </h2>
          </div>

          <div className="flex-1 w-full min-h-0">
            {chartsLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
            ) : !salaryByDeptData.length ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No payroll data for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salaryByDeptData}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke={chartTheme.text} 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    width={75}
                  />
                  <Tooltip
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      borderColor: chartTheme.tooltipBorder,
                      borderRadius: 8,
                      fontSize: '11px',
                      color: chartTheme.tooltipText,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Cost']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#3B82F6" 
                    radius={[0, 4, 4, 0]} 
                    barSize={16} 
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Panel 2: Payroll Trend */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800/90 rounded-xl p-5 shadow-sm h-[270px] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Payroll Trend
            </h2>
          </div>

          <div className="flex-1 w-full min-h-0">
            {chartsLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
            ) : !payrollTrendData.length ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No payroll data for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={payrollTrendData} margin={{ top: 8, right: 12, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke={chartTheme.text} 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke={chartTheme.text} 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      borderColor: chartTheme.tooltipBorder,
                      borderRadius: 8,
                      fontSize: '11px',
                      color: chartTheme.tooltipText,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                    formatter={(val, name, item) => [
                      `₹${Number(val).toLocaleString('en-IN')} (${item.payload.change})`, 
                      'Total Payroll'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#payrollGradient)"
                    activeDot={{ r: 4, fill: '#3B82F6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Panel 3: Payroll Status */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800/90 rounded-xl p-5 shadow-sm h-[270px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Payroll Status
              </h2>
            </div>

            {/* Compact status counts */}
            <div className="grid grid-cols-4 gap-2 py-2 border-b border-slate-100 dark:border-slate-800 text-center">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Paid</span>
                <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">58</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Computed</span>
                <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">4</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Draft</span>
                <span className="text-sm font-bold font-mono text-amber-500">2</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Warnings</span>
                <span className="text-sm font-bold font-mono text-rose-500">3</span>
              </div>
            </div>
          </div>

          {/* Small clean alert list */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Attention Items
            </div>
            
            <div className="space-y-1.5 text-xs">
              <Link to="/intelligence" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span className="truncate">2 contracts pending salary review</span>
              </Link>
              <Link to="/intelligence" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span className="truncate">1 missing check-out in Engineering</span>
              </Link>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
            <Link to="/payruns" className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium">
              View Payruns →
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Row 2: Attendance Trend, Time Off & Departments (Compact ~270px) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Panel 4: Attendance Trend (7-day Line Graph replacing donut) */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800/90 rounded-xl p-5 shadow-sm h-[270px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Attendance Trend
              </h2>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">94%</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Current average</span>
            </div>
          </div>

          {/* 7-day Line Graph */}
          <div className="flex-1 w-full min-h-0 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData} margin={{ top: 6, right: 8, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke={chartTheme.text} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  domain={[80, 100]} 
                  stroke={chartTheme.text} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    borderColor: chartTheme.tooltipBorder,
                    borderRadius: 8,
                    fontSize: '11px',
                    color: chartTheme.tooltipText,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                  formatter={(val, name) => [`${val}%`, name === 'attendance' ? 'Attendance' : 'Late Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#3B82F6" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, fill: '#3B82F6' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="late" 
                  stroke="#F59E0B" 
                  strokeWidth={1.5} 
                  strokeDasharray="3 3"
                  dot={false}
                  activeDot={{ r: 3, fill: '#F59E0B' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>Present · Late · Absent</span>
            <Link to="/attendance" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium">
              Logs →
            </Link>
          </div>
        </div>

        {/* Panel 5: Time Off */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800/90 rounded-xl p-5 shadow-sm h-[270px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Time Off
              </h2>
              <Link to="/time-off" className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium">
                Manage
              </Link>
            </div>

            {/* 3 compact summary values */}
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 dark:border-slate-800 text-center text-xs mb-2">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Approved</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">12</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Pending</span>
                <span className="font-bold font-mono text-amber-500">3</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Available</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">343d</span>
              </div>
            </div>

            {/* Compact Table */}
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                  <th className="pb-1.5 font-medium">Type</th>
                  <th className="pb-1.5 font-medium text-right">Approved</th>
                  <th className="pb-1.5 font-medium text-right">Pending</th>
                  <th className="pb-1.5 font-medium text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {timeOffData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2 text-slate-800 dark:text-slate-200 font-medium">{row.type}</td>
                    <td className="py-2 text-right font-mono text-emerald-600 dark:text-emerald-400">{row.approved}</td>
                    <td className="py-2 text-right font-mono text-amber-500">{row.pending}</td>
                    <td className="py-2 text-right font-mono font-medium text-slate-900 dark:text-white">{row.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-1 text-[11px] text-slate-400 text-right">
            <span>Cycle: FY26 Q3</span>
          </div>
        </div>

        {/* Panel 6: Departments */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800/90 rounded-xl p-5 shadow-sm h-[270px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Departments
              </h2>
              <Link to="/employees" className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium">
                View Directory
              </Link>
            </div>

            {/* Compact Table */}
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                  <th className="pb-2 font-medium">Department</th>
                  <th className="pb-2 font-medium text-right">Employees</th>
                  <th className="pb-2 font-medium text-right">Monthly Payroll</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {departmentData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 text-slate-800 dark:text-slate-200 font-medium">{row.name}</td>
                    <td className="py-2.5 text-right font-mono text-slate-500 dark:text-slate-400">{row.employees}</td>
                    <td className="py-2.5 text-right font-mono font-semibold text-slate-900 dark:text-white">{row.payroll}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>4 active departments</span>
            <span className="font-mono font-medium text-slate-600 dark:text-slate-400">29 total staff</span>
          </div>
        </div>
      </div>
    </div>
  );
}
