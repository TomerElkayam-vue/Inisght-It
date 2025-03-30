import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../../services/auth.service';

export const PublicRoute = () => {
  const token = getToken();

  if (token) {
    // Redirect to stats if already authenticated
    return <Navigate to="/stats" replace />;
  }

  // Render child routes if not authenticated
  return <Outlet />;
}; 