import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import AccessDenied from './AccessDenied';

export default function ProtectedRoute({ children }) {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
