import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoDark from '../../assets/logo-dark.png';
import { removeToken } from '../../services/auth.service';
import { useEffect } from 'react';
import { useProjects } from '../hooks/useProjectQueries';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-[#2b3544]' : '';
  };

  const handleLogout = () => {
    removeToken();
    navigate('/');
  };

  // Fetch all projects
  const { data: projects, isLoading: isLoadingProjects, isError: isProjectsError } = useProjects();
  
  // Get current project context
  const { currentProject, setCurrentProject } = useCurrentProjectContext();

  // Handle project change
  const handleProjectChange = (projectId: string) => {
    const selectedProject = projects?.find(p => p.id === projectId);
    if (selectedProject) {
      setCurrentProject(selectedProject);
    }
  };

  // Auto-select first project if none is selected
  useEffect(() => {
    if (!isLoadingProjects && projects && projects.length > 0 && !currentProject) {
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
  const isProtectedRoute = ['/stats', '/insights', '/project-management'].includes(location.pathname);
  
  // Redirect to error page if trying to access protected route without a project
  useEffect(() => {
    if (isProtectedRoute && !isLoadingProjects && isProjectsError) {
      navigate('/no-projects');
    }
  }, [isProtectedRoute, isLoadingProjects, isProjectsError, navigate]);

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
      <nav className="bg-[#1e2530] h-16 fixed w-full top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center">
              <img src={logoDark} alt="Logo" className="h-10 w-auto" />
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/stats"
                className={`text-white px-4 py-2 rounded-lg transition-colors ${isActive(
                  '/stats'
                )}`}
              >
                סטטיסטיקות
              </Link>
              <Link
                to="/insights"
                className={`text-white px-4 py-2 rounded-lg transition-colors ${isActive(
                  '/insights'
                )}`}
              >
                תובנות צוותיות
              </Link>
              <Link
                to="/project-management"
                className={`text-white px-4 py-2 rounded-lg transition-colors ${isActive(
                  '/project-management'
                )}`}
              >
                ניהול פרויקט
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={currentProject?.id || ''}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="bg-[#2b3544] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoadingProjects}
              >
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <span className="text-white">שלום שחר שמש</span>
                <button
                  className="bg-[#2b3544] text-white px-4 py-2 rounded-lg hover:bg-[#353f4f] transition-colors"
                  onClick={handleLogout}
                >
                  התנתק
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
