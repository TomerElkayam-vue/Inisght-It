import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoDark from '../../assets/logo-dark.png';
import { removeToken } from '../../services/auth.service';
import { useEffect, useState } from 'react';
import { useProjects } from '../hooks/useProjectQueries';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { useCreateProject } from '../hooks/useProjectQueries';

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

  // --- Modal state ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [error, setError] = useState('');
  const createProjectMutation = useCreateProject();
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const handleOpenModal = () => {
    setNewProjectName('');
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewProjectName('');
    setError('');
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('יש להזין שם לפרויקט');
      return;
    }
    try {
      const newProject = await createProjectMutation.mutateAsync({ name: newProjectName });
      setCurrentProject(newProject);
      handleCloseModal();
    } catch (e) {
      setToast({ message: 'אופס, משהו השתבש', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

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
      {/* Modal for creating a project */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#23263a] p-8 rounded-2xl shadow-lg w-96 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-white">צור פרויקט חדש</h2>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-[#3a3a4d] border-none focus:outline-none text-white text-right mb-4"
              placeholder="שם הפרויקט"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              autoFocus
            />
            {error && <div className="text-red-400 mb-2 w-full text-right">{error}</div>}
            <div className="flex gap-2 w-full">
              <button
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                onClick={handleCreateProject}
                disabled={createProjectMutation.isPending}
              >
                {createProjectMutation.isPending ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'צור פרויקט'
                )}
              </button>
              <button
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={handleCloseModal}
                disabled={createProjectMutation.isPending}
              >
                ביטול
              </button>
            </div>
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
              {/* Create Project Button */}
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={handleOpenModal}
              >
                צור פרויקט
              </button>
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
