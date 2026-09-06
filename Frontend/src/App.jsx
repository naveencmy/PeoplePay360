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
  const role = (user?.role || '').toUpperCase();
  if (role === 'EMPLOYEE') return <Navigate to="/my-space" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'AUDITOR']}><DashboardPage /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'AUDITOR']}><EmployeesPage /></ProtectedRoute>} />
          <Route path="/employees/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'AUDITOR', 'EMPLOYEE']}><EmployeeDetailPage /></ProtectedRoute>} />
          <Route path="/contracts" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'AUDITOR']}><ContractsPage /></ProtectedRoute>} />
          <Route path="/schedules" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'AUDITOR']}><SchedulesPage /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'AUDITOR', 'EMPLOYEE']}><AttendancePage /></ProtectedRoute>} />
          <Route path="/time-off" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'AUDITOR', 'EMPLOYEE']}><TimeOffPage /></ProtectedRoute>} />
          <Route path="/time-off/allocations" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'AUDITOR']}><TimeOffPage initialTab="allocations" /></ProtectedRoute>} />
          <Route path="/time-off/types" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'AUDITOR']}><TimeOffPage initialTab="types" /></ProtectedRoute>} />
          <Route path="/salary-structures" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'AUDITOR']}><SalaryStructuresPage /></ProtectedRoute>} />
          <Route path="/salary-rules/:structureId" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'AUDITOR']}><SalaryRulesPage /></ProtectedRoute>} />
          <Route path="/payruns" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'AUDITOR']}><PayrunsPage /></ProtectedRoute>} />
          <Route path="/payruns/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'AUDITOR']}><PayrunDetailPage /></ProtectedRoute>} />
          <Route path="/payslips" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'AUDITOR', 'EMPLOYEE']}><PayslipsPage /></ProtectedRoute>} />
          <Route path="/payslips/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'AUDITOR', 'EMPLOYEE']}><PayslipDetailPage /></ProtectedRoute>} />
          <Route path="/simulator" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'AUDITOR']}><SimulatorPage /></ProtectedRoute>} />
          <Route path="/intelligence" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'AUDITOR']}><PayrollIntelligencePage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/my-space" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'AUDITOR', 'EMPLOYEE']}><MySpacePage /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
