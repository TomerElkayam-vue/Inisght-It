import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoDark from '../../assets/logo-dark.png';
import { removeTokens } from '../../services/auth.service';
import { useEffect, useState } from 'react';
import { useProjects } from '../hooks/useProjectQueries';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { useCreateProject } from '../hooks/useProjectQueries';
import CreateProjectButton from './CreateProjectButton';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'bg-[#23263a] text-blue-400'
      : 'hover:bg-[#23263a] hover:text-blue-300';
  };

  const handleLogout = () => {
    removeTokens();
    navigate('/');
  };

  // Fetch all projects
  const {
    data: projects,
    isLoading: isLoadingProjects,
    isError: isProjectsError,
  } = useProjects();

  // Get current project context
  const { currentProject, setCurrentProject } = useCurrentProjectContext();

  // Handle project change
  const handleProjectChange = (projectId: string) => {
    const selectedProject = projects?.find((p) => p.id === projectId);
    if (selectedProject) {
      setCurrentProject(selectedProject);
    }
  };

  // Auto-select first project if none is selected
  useEffect(() => {
    if (
      !isLoadingProjects &&
      projects &&
      projects.length > 0 &&
      !currentProject
    ) {
      setCurrentProject(projects[0]);
    }
  }, [isLoadingProjects, projects, currentProject, setCurrentProject]);

  // Redirect to error page only if there's an error from the server
  useEffect(() => {
    if (!isLoadingProjects && isProjectsError) {
      navigate('/no-projects');
    }
  }, [isLoadingProjects, isProjectsError, navigate]);

  // Check if current route requires a project
  const isProtectedRoute = [
    '/stats',
    '/insights',
    '/project-management',
  ].includes(location.pathname);

  // Redirect to error page if trying to access protected route without a project
  useEffect(() => {
    if (isProtectedRoute && !isLoadingProjects && isProjectsError) {
      navigate('/no-projects');
    }
  }, [isProtectedRoute, isLoadingProjects, isProjectsError, navigate]);

  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success';
  } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {isLoadingProjects && (
        <div className="fixed inset-0 bg-[#151921] bg-opacity-90 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg">טוען פרויקטים...</span>
          </div>
        </div>
      )}
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-1/2 translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-lg text-white text-lg transition-all
            ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}
        >
          {toast.message}
        </div>
      )}
      {/* Top bar */}
      <nav className="bg-[#1e2530] h-16 fixed w-full top-0 z-40 shadow-lg flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <img src={logoDark} alt="Logo" className="h-10 w-auto" />
        </div>
        <div className="flex items-center gap-4">
          {/* Hamburger menu */}
          <button
            className="text-white text-2xl focus:outline-none ml-2"
            onClick={() => setDrawerOpen(true)}
            aria-label="פתח תפריט"
          >
            <svg
              width="28"
              height="28"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>
      {/* Drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="fixed right-0 top-0 h-full w-80 bg-[#23263a] shadow-2xl flex flex-col p-6 gap-6 animate-slideIn z-50"
            dir="rtl"
          >
            <button
              className="self-end text-gray-400 hover:text-white text-2xl font-bold focus:outline-none mb-2"
              onClick={() => setDrawerOpen(false)}
              aria-label="סגור תפריט"
            >
              ×
            </button>
            <Link
              to="/stats"
              className={`block px-4 py-3 rounded-lg text-white text-lg font-medium transition-colors ${isActive(
                '/stats'
              )}`}
              onClick={() => setDrawerOpen(false)}
            >
              סטטיסטיקות
            </Link>
            <Link
              to="/insights"
              className={`block px-4 py-3 rounded-lg text-white text-lg font-medium transition-colors ${isActive(
                '/insights'
              )}`}
              onClick={() => setDrawerOpen(false)}
            >
              תובנות
            </Link>
            <Link
              to="/project-management"
              className={`block px-4 py-3 rounded-lg text-white text-lg font-medium transition-colors ${isActive(
                '/project-management'
              )}`}
              onClick={() => setDrawerOpen(false)}
            >
              ניהול פרויקט
            </Link>
            {currentProject && (
              <div className="flex flex-col gap-2">
                <label className="text-white text-sm mb-1">בחר פרויקט</label>
                <select
                  value={currentProject?.id || ''}
                  onChange={(e) => {
                    handleProjectChange(e.target.value);
                    setDrawerOpen(false);
                  }}
                  className="bg-[#2b3544] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-900"
                  disabled={isLoadingProjects}
                >
                  {projects &&
                    projects.length > 0 &&
                    projects?.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <CreateProjectButton
              onProjectCreated={(project) => setCurrentProject(project)}
              setToast={setToast}
            />
            <button
              className="bg-[#2b3544] hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-bold mt-auto"
              onClick={handleLogout}
            >
              התנתק
            </button>
          </aside>
        </div>
      )}
      {/* Drawer animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.2s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </>
  );
};
