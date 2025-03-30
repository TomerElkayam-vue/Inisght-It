import { RouteObject } from 'react-router-dom';
import LoginPage from '../components/Login';
import { StatsPage } from '../components/stats/StatsPage';
import { TeamInsights } from '../components/insights/TeamInsights';
import { AuthGuard } from '../components/auth/AuthGuard';
import { PublicRoute } from '../components/auth/PublicRoute';
import { Navigate } from 'react-router-dom';
import { getToken } from '../services/auth.service';

// Helper function to determine where to redirect on 404
const NotFoundRedirect = () => {
  const token = getToken();
  return token ? <Navigate to="/stats" replace /> : <Navigate to="/" replace />;
};

export const routes: RouteObject[] = [
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/stats',
        element: <StatsPage />,
      },
      {
        path: '/insights',
        element: <TeamInsights />,
      },
      {
        path: '/tasks',
        element: <div>Tasks Page (Coming Soon)</div>,
      },
      {
        path: '/team',
        element: <div>Team Page (Coming Soon)</div>,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundRedirect />,
  },
]; 