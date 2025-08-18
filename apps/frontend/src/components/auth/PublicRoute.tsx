import { Navigate, Outlet } from 'react-router-dom';
import { getRefreshToken } from '../../services/auth.service';

export const PublicRoute = () => {
  const refreshToken = getRefreshToken();

  if (refreshToken) {
    return <Navigate to="/sprints-stats" replace />;
  }

  return <Outlet />;
};
