import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../../services/auth.service';

export const AuthGuard = () => {
  const token = getToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}; 