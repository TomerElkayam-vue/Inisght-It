import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoDark from '../../assets/logo-dark.png';
import { removeTokens } from '../../services/auth.service';
import { useEffect, useState } from 'react';
import { useProjects } from '../hooks/useProjectQueries';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import CreateProjectButton from './CreateProjectButton';
import { useProjectRole } from '../../hooks/useProjectRole';
import { useCurrentConnectedUser } from '../../context/CurrentConnectedUserContext';

import { MdInsights, MdManageAccounts } from 'react-icons/md';
import { FaProjectDiagram, FaUser, FaUserCircle } from 'react-icons/fa';
import { RiTeamFill } from 'react-icons/ri';
import { nameToDisplay } from '../../utils/text';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentProject, setCurrentProject } = useCurrentProjectContext();
  const { user } = useCurrentConnectedUser();

  const userRole = useProjectRole(currentProject, user);

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-yellow-400'
      : 'hover:bg-[#2b2f46] ';
  };
  const handleLogout = () => {
    removeTokens();
    setCurrentProject(null);
    localStorage.removeItem('currentProject');
    navigate('/');
  };

  const {
    data: projects,
    isLoading: isLoadingProjects,
    isError: isProjectsError,
  } = useProjects(user?.id);

  const handleProjectChange = (projectId: string) => {
    const selectedProject = projects?.find((p) => p.id === projectId);
    if (selectedProject) {
      setCurrentProject(selectedProject);
    }
  };

  useEffect(() => {
    if (
      !currentProject &&
      !isLoadingProjects &&
      projects &&
      projects.length > 0
    ) {
      if (!currentProject) {
        setCurrentProject(projects[projects.length - 1]);
      }
    }
  }, [isLoadingProjects, projects]);

  useEffect(() => {
    if (!isLoadingProjects && (projects?.length == 0 || isProjectsError)) {
      navigate('/no-projects');
    }
  }, [isLoadingProjects, isProjectsError, navigate]);

  const isProtectedRoute = [
    '/sprints-stats',
    '/project-stats',
    '/insights',
    '/project-management',
  ].includes(location.pathname);

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
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

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
      {toast && (
        <div
          className={`fixed top-4 right-1/2 translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-lg text-white text-lg transition-all
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}
        >
          {toast.message}
        </div>
      )}
      <nav className="bg-[#1e2530] h-16 fixed w-full top-0 z-40 shadow-lg flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <img src={logoDark} alt="Logo" className="h-10 w-auto" />
        </div>
        <div className="flex items-center gap-4 text-white">
          {user?.username && (
            <div
              className="flex items-center gap-2 bg-[#f8d94e]/60 text-black px-4 py-1.5 rounded-full cursor-default"
              dir="rtl"
              title={nameToDisplay(user.username)}
            >
              <FaUserCircle className="w-4 h-4 opacity-80" />
              <span className="text-sm font-medium max-w-[160px] truncate">
                {nameToDisplay(user.username)}
              </span>
            </div>
          )}
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
      {drawerOpen && (
        <div className="fixed inset-0" style={{ zIndex: 150 }}>
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="fixed right-0 top-0 h-full w-80 bg-[#23263a] shadow-2xl flex flex-col p-6 gap-3 animate-slideIn"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-2 w-full">
              {user?.username && (
                <div
                  className="flex items-center gap-2 bg-[#f8d94e]/60 text-black px-4 py-1.5 rounded-full cursor-default"
                  dir="rtl"
                  title={user.username}
                >
                  <FaUserCircle className="w-5 h-5 opacity-80" />
                  <span className="text-sm font-medium truncate">
                    {nameToDisplay(user.username)}
                  </span>
                </div>
              )}
              <button
                className="text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
                onClick={() => setDrawerOpen(false)}
                aria-label="סגור תפריט"
              >
                ×
              </button>
            </div>

            <Link
              to="/sprints-stats"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-lg font-medium transition-colors ${isActive(
                '/sprints-stats'
              )}`}
              onClick={() => setDrawerOpen(false)}
            >
              <MdInsights className="w-5 h-5" />
              תובנות לפי ספרינט
            </Link>

            <Link
              to="/project-stats"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-lg font-medium transition-colors ${isActive(
                '/project-stats'
              )}`}
              onClick={() => setDrawerOpen(false)}
            >
              <FaProjectDiagram className="w-5 h-5" />
              תובנות על הפרויקט
            </Link>

            {userRole === 'OWNER' && (
              <Link
                to="/team-insights"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-lg font-medium transition-colors ${isActive(
                  '/team-insights'
                )}`}
                onClick={() => setDrawerOpen(false)}
              >
                <RiTeamFill className="w-5 h-5" />
                פרופיל צוות ותובנות AI{' '}
              </Link>
            )}

            {userRole === 'OWNER' && (
              <Link
                to="/insights"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-lg font-medium transition-colors ${isActive(
                  '/insights'
                )}`}
                onClick={() => setDrawerOpen(false)}
              >
                <FaUser className="w-5 h-5" />
                פרופיל עובד ותובנות AI
              </Link>
            )}

            {userRole === 'OWNER' && (
              <Link
                to="/project-management"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-lg font-medium transition-colors ${isActive(
                  '/project-management'
                )}`}
                onClick={() => setDrawerOpen(false)}
              >
                <MdManageAccounts className="w-5 h-5" />
                ניהול פרויקט
              </Link>
            )}

            {projects && projects.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-white text-sm mb-1">בחר פרויקט</label>
                <div className="relative" dir="rtl">
                  <button
                    type="button"
                    className="w-full bg-[#3a3a4d] text-white px-4 py-2 rounded-md flex items-center justify-between border border-white/10"
                    onClick={() => setProjectMenuOpen((open) => !open)}
                  >
                    <span className="truncate text-right">
                      {currentProject?.name || projects[0]?.name}
                    </span>
                    <svg
                      className="w-4 h-4 opacity-80"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                    </svg>
                  </button>
                  {projectMenuOpen && (
                    <ul className="absolute right-0 mt-2 w-full bg-[#3a3a4d] rounded-md max-h-48 overflow-auto custom-scrollbar text-sm text-right shadow-lg z-50">
                      {projects.map((project) => (
                        <li
                          key={project.id}
                          className="p-2 hover:bg-[#e6c937] hover:text-black text-white cursor-pointer rounded-md"
                          onClick={() => {
                            handleProjectChange(project.id);
                            setProjectMenuOpen(false);
                            setDrawerOpen(false);
                          }}
                          title={project.name}
                        >
                          <span className="truncate block">{project.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            <CreateProjectButton
              onProjectCreated={(project) => {
                navigate('/project-management');
                setDrawerOpen(false);
                setCurrentProject(project);
              }}
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

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.2s cubic-bezier(0.4,0,0.2,1); }
      `}</style>
    </>
  );
};
