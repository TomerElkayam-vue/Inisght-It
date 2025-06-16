import { RouteObject } from 'react-router-dom';
import LoginPage from '../components/Login';
import { SprintsStatsPage } from '../components/SprintsStats/SprintsStatsPage';
import RegisterPage from '../components/Register';
import { AuthGuard } from '../components/auth/AuthGuard';
import { PublicRoute } from '../components/auth/PublicRoute';
import { Navigate } from 'react-router-dom';
import { getRefreshToken } from '../services/auth.service';
import ProjectManagement from '../components/ProjectManagment/ProjectManagment';
import { ProjectManagementProvider } from '../context/ProjectManagementContext';
import NoProjects from '../components/NoProjects';
import { WorkerInsights } from '../components/insights/WorkerInsights';
import { TeamInsights } from '../components/insights/TeamInsights';
import { ProjectsStatsPage } from '../components/ProjectsStats/ProjectsStatsPage';

// Helper function to determine where to redirect on 404
const NotFoundRedirect = () => {
  const refreshToken = getRefreshToken();
  return refreshToken ? (
    <Navigate to="/sprints-stats" replace />
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
        path: '/sprints-stats',
        element: <SprintsStatsPage />,
      },
      {
        path: '/project-stats',
        element: <ProjectsStatsPage />,
      },
      {
        path: '/insights',
        element: <WorkerInsights />,
      },
      {
        path: '/team-insights',
        element: <TeamInsights />,
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
