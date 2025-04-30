import ProjectMembers from './ProjectMembers';
import ToolCredentials from './ToolsCredentials';
import {
  ProjectProvider,
  useProjectContext,
} from '../../context/ProjectContext';

const ProjectContent = () => {
  const { employees, codeBaseCredentials, managmentCredentials } =
    useProjectContext();

  const handleSave = () => {
    console.log({
      employees,
      codeBaseCredentials,
      managmentCredentials,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center gap-8 bg-[#1e1e2f] text-white relative">
      <button
        onClick={handleSave}
        className="fixed left-4 bottom-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-lg font-medium rounded-lg shadow-md transition duration-300 ease-in-out"
      >
        שמור
      </button>
      <ToolCredentials />
      <ProjectMembers />
    </div>
  );
};

const ProjectManagment = () => {
  return (
    <ProjectProvider>
      <ProjectContent />
    </ProjectProvider>
  );
};

export default ProjectManagment;
