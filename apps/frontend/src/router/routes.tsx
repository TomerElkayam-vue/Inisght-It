import { RouteObject } from 'react-router-dom';
import LoginPage from '../components/Login';
import RegisterPage from '../components/Register';
import { StatsPage } from '../components/stats/StatsPage';
import { AuthGuard } from '../components/auth/AuthGuard';
import { PublicRoute } from '../components/auth/PublicRoute';
import { Navigate } from 'react-router-dom';
import { getToken } from '../services/auth.service';
import { UserInsights } from '../components/insights/UserInsights';
import ProjectManagement from '../components/ProjectManagment/ProjectManagment';
import { ProjectManagementProvider } from '../context/ProjectManagementContext';

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
      {
        path: '/register',
        element: <RegisterPage />,
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
        element: <UserInsights />,
      },
      {
        path: '/project-management',
        element: (
          <ProjectManagementProvider>
            <ProjectManagement />
          </ProjectManagementProvider>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundRedirect />,
  },
];
