import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../../services/auth.service';

export const AuthGuard = () => {
  const token = getToken();

  if (!token) {
    // Redirect to login if there's no token
    return <Navigate to="/" replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
}; 