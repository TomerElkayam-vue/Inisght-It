import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoDark from '../../assets/logo-dark.png';
import { removeToken } from '../../services/auth.service';
import { useEffect } from 'react';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { useProjects } from '../hooks/useProjectQueries';
import { AutoCompleteInput } from '../common/AutoCompleteInput';

export const Navbar = () => {
  const { data: projects = [] } = useProjects();
  const { currentProject, setCurrentProject } = useCurrentProjectContext();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-[#2b3544]' : '';
  };

  const handleLogout = () => {
    removeToken();
    navigate('/');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    console.log(token);
  }, []);

  useEffect(() => {
    if (!currentProject) {
      setCurrentProject(projects[0])
    }
  }, [projects]);

  return (
    <nav className="bg-[#1e2530] h-16 fixed w-full top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center gap-4">
            <img src={logoDark} alt="Logo" className="h-10 w-auto" />

            <div className="w-64">
            <AutoCompleteInput
                options={projects}
                value={currentProject}
                onChange={setCurrentProject}
                getOptionLabel={(project) => project.name}
                placeholder="בחר פרויקט..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/stats"
              className={`text-white px-4 py-2 rounded-lg transition-colors ${isActive('/stats')}`}
            >
              סטטיסטיקות
            </Link>
            <Link
              to="/insights"
              className={`text-white px-4 py-2 rounded-lg transition-colors ${isActive('/insights')}`}
            >
              תובנות צוותיות
            </Link>
            <Link
              to="/project-management"
              className={`text-white px-4 py-2 rounded-lg transition-colors ${isActive('/project-management')}`}
            >
              ניהול פרויקט
            </Link>
          </div>

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
    </nav>
  );
};
