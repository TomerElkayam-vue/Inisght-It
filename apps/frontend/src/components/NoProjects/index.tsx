import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CreateProjectButton from '../Navbar/CreateProjectButton';
import { useProjects } from '../hooks/useProjectQueries';
import { useCurrentConnectedUser } from '../../context/CurrentConnectedUserContext';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';

const NoProjects = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success';
  } | null>(null);

  const { user } = useCurrentConnectedUser();
  const { setCurrentProject } = useCurrentProjectContext();
  const { data: projects, isLoading: isLoadingProjects } = useProjects(
    user?.id
  );

  // Redirect to error page only if there's an error from the server or no projects
  useEffect(() => {
    if (!isLoadingProjects && projects?.length !== 0) {
      navigate('/sprints-stats');
    }
  }, [isLoadingProjects, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#151921] flex items-center justify-center">
      <div
        className="bg-[#1e2530] p-8 rounded-lg shadow-lg max-w-md w-full text-center"
        dir="rtl"
      >
        <h1 className="text-2xl font-bold text-white mb-4">
          פעם ראשונה שלך אצלנו?
        </h1>
        <p className="text-gray-300 mb-6">
          נראה שלא מקושר אליך אף פרויקט, צור אחד חדש כעת!
        </p>
        <div className="flex flex-row-reverse gap-4 justify-center">
          <CreateProjectButton
            onProjectCreated={(project) => {
              navigate('/project-management');
              setCurrentProject(project);
            }}
            setToast={setToast}
          />
          <button
            onClick={() => navigate('/')}
            className="bg-[#2b3544] text-white px-4 py-2 rounded-lg hover:bg-[#353f4f] transition-colors font-bold mt-2 min-w-[120px]"
          >
            נסה שוב
          </button>
        </div>
        {toast && (
          <div
            className={`mt-6 px-6 py-3 rounded-lg shadow-lg text-white text-lg transition-all ${
              toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoProjects;
