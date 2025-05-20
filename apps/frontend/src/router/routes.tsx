import { RouteObject } from 'react-router-dom';
import LoginPage from '../components/Login';
import { StatsPage } from '../components/Stats/StatsPage';
import { AuthGuard } from '../components/auth/AuthGuard';
import { PublicRoute } from '../components/auth/PublicRoute';
import { Navigate } from 'react-router-dom';
import { getToken } from '../services/auth.service';
import { UserInsights } from '../components/insights/UserInsights';
import ProjectManagement from '../components/ProjectManagment/ProjectManagment';
import { ProjectManagementProvider } from '../context/ProjectManagementContext';
import NoProjects from '../components/NoProjects';

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
      {
        path: '/no-projects',
        element: <NoProjects />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundRedirect />,
  },
];
