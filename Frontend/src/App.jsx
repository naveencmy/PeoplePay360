import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import NotFound from './components/layout/NotFound';
import useAuthStore from './store/authStore';

// Eagerly loaded pages (already confirmed to exist)
import EmployeesPage from './pages/EmployeesPage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import ContractsPage from './pages/ContractsPage';
import SchedulesPage from './pages/SchedulesPage';
import AttendancePage from './pages/AttendancePage';
import TimeOffPage from './pages/TimeOffPage';
import SalaryStructuresPage from './pages/SalaryStructuresPage';
import SalaryRulesPage from './pages/SalaryRulesPage';
import PayrunsPage from './pages/PayrunsPage';
import PayrunDetailPage from './pages/PayrunDetailPage';
import PayslipsPage from './pages/PayslipsPage';
import PayslipDetailPage from './pages/PayslipDetailPage';
import DashboardPage from './pages/DashboardPage';
import SimulatorPage from './pages/SimulatorPage';
import AdminUsersPage from './pages/AdminUsersPage';
import MySpacePage from './pages/MySpacePage';
import PayrollIntelligencePage from './pages/PayrollIntelligencePage';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
    </div>
  );
}

function HomeRedirect() {
  const user = useAuthStore(s => s.user);
  if (user?.role === 'employee') return <Navigate to="/my-space" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/time-off" element={<TimeOffPage />} />
          <Route path="/time-off/allocations" element={<TimeOffPage initialTab="allocations" />} />
          <Route path="/time-off/types" element={<TimeOffPage initialTab="types" />} />
          <Route path="/salary-structures" element={<SalaryStructuresPage />} />
          <Route path="/salary-rules/:structureId" element={<SalaryRulesPage />} />
          <Route path="/payruns" element={<PayrunsPage />} />
          <Route path="/payruns/:id" element={<PayrunDetailPage />} />
          <Route path="/payslips" element={<PayslipsPage />} />
          <Route path="/payslips/:id" element={<PayslipDetailPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/intelligence" element={<PayrollIntelligencePage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/my-space" element={<MySpacePage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
