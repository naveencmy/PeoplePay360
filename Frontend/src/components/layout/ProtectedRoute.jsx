import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import AccessDenied from './AccessDenied';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, hasRole } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = (user?.role || '').toUpperCase();
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    if (role === 'EMPLOYEE') {
      return <Navigate to="/my-space" replace />;
    }
    return <AccessDenied />;
  }

  return children;
}
