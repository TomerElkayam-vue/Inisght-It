import { Navigate, Outlet } from 'react-router-dom';
import { getRefreshToken } from '../../services/auth.service';

export const PublicRoute = () => {
  const refreshToken = getRefreshToken();

  if (refreshToken) {
    // Redirect to stats if already authenticated
    return <Navigate to="/stats" replace />;
  }

  // Render child routes if not authenticated
  return <Outlet />;
};
