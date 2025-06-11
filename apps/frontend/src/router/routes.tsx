import { RouteObject } from 'react-router-dom';
import LoginPage from '../components/Login';
import { TeamStatsPage } from '../components/Stats/StatsPage';
import RegisterPage from '../components/Register';
import { AuthGuard } from '../components/auth/AuthGuard';
import { PublicRoute } from '../components/auth/PublicRoute';
import { Navigate } from 'react-router-dom';
import { getRefreshToken } from '../services/auth.service';
import ProjectManagement from '../components/ProjectManagment/ProjectManagment';
import { ProjectManagementProvider } from '../context/ProjectManagementContext';
import NoProjects from '../components/NoProjects';
import { WorkerInsights } from '../components/insights/WorkerInsights';

// Helper function to determine where to redirect on 404
const NotFoundRedirect = () => {
  const refreshToken = getRefreshToken();
  return refreshToken ? (
    <Navigate to="/stats" replace />
  ) : (
    <Navigate to="/" replace />
  );
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
        element: <TeamStatsPage />,
      },
      {
        path: '/insights',
        element: <WorkerInsights />,
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
