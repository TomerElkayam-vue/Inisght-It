import { useState } from 'react';
import { useCreateProject } from '../hooks/useProjectQueries';
import { Project } from '@packages/projects';
interface CreateProjectButtonProps {
  onProjectCreated: (project: Project) => void;
  setToast: (
    toast: { message: string; type: 'error' | 'success' } | null
  ) => void;
}

const CreateProjectButton: React.FC<CreateProjectButtonProps> = ({
  onProjectCreated,
  setToast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [error, setError] = useState('');
  const createProjectMutation = useCreateProject();

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
      const newProject = await createProjectMutation.mutateAsync({
        name: newProjectName,
      });
      const completeProject: Project = {
        ...newProject,
        projectPermissions: newProject.projectPermissions || [],
        codeRepositoryCredentials: newProject.codeRepositoryCredentials || null,
        missionManagementCredentials:
          newProject.missionManagementCredentials || null,
      };
      onProjectCreated(completeProject);
      setToast({ message: 'הפרויקט נוצר בהצלחה!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
      handleCloseModal();
    } catch (e) {
      setToast({ message: 'אופס, משהו השתבש', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <>
      <button
        type="button"
        className="bg-[#f8d94e] hover:bg-[#e6c937] text-black px-4 py-2 rounded-lg transition-colors font-bold mt-2"
        onClick={handleOpenModal}
      >
        + צור פרויקט
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#23263a] p-8 rounded-2xl shadow-lg w-96 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-white">
              צור פרויקט חדש
            </h2>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-[#3a3a4d] border-none focus:outline-none text-white text-right mb-4"
              placeholder="שם הפרויקט"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
              autoFocus
            />
            {error && (
              <div className="text-red-400 mb-2 w-full text-right">{error}</div>
            )}
            <div className="flex gap-2 w-full">
              <button
                className="flex-1 bg-[#f8d94e] hover:bg-[#e6c937] text-black  px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
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
    </>
  );
};

export default CreateProjectButton;
