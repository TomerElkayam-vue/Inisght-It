import { useMemo } from 'react';
import ProjectMembers from './ProjectMembers';
import ToolCredentials from './ToolsCredentials';
import {
  ProjectManagementProvider,
  useProjectManagementContext,
} from '../../context/ProjectManagementContext';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { useUpdateProject } from '../hooks/useProjectQueries';

const ProjectContent = () => {
  const { currentProject } = useCurrentProjectContext();
  const {
    employees,
    setEmployees,
    codeBaseCredentials,
    setCodeBaseCredentials,
    managementCredentials,
    setManagementCredentials,
  } = useProjectManagementContext();

  const updateProjectMutation = useUpdateProject();

  useMemo(() => {
    if (currentProject) {
      setCodeBaseCredentials(currentProject.codeRepositoryCredentials ?? null);
      setManagementCredentials(
        currentProject.missionManagementCredentials ?? null
      );

      // Initialize employees list from project permissions
      // Filter out owners (roleId === 1) from the employees list

      if (currentProject.projectPermissions) {
        const memberEmployees = currentProject.projectPermissions
          .filter((permission) => permission.roleId !== 1)
          .map(({ user }) => ({ id: user.id, username: user.username }));

        setEmployees(memberEmployees);
      }
    }
  }, [currentProject]);

  const handleSave = async () => {
    if (!currentProject?.id) return;

    try {
      const projectPermissions = {
        deleteMany: {},
        create: [
          ...employees.map((employee) => ({
            userId: employee.id,
            roleId: 2, // Member role
          })),
          ...(currentProject.projectPermissions
            ?.filter((permission) => permission.roleId == 1)
            ?.map((user) => ({
              userId: user.userId,
              roleId: 1,
            })) ?? []),
        ],
      };

      await updateProjectMutation.mutateAsync({
        id: currentProject.id,
        data: {
          codeRepositoryCredentials: codeBaseCredentials,
          missionManagementCredentials: managementCredentials,
          projectPermissions: projectPermissions,
        },
      });
      console.log('Project updated successfully');
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gap-8 bg-[#1e1e2f] text-white relative">
      <button
        onClick={handleSave}
        className="fixed left-4 bottom-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-lg font-medium rounded-lg shadow-md transition duration-300 ease-in-out"
        disabled={updateProjectMutation.isPending}
      >
        {updateProjectMutation.isPending ? 'Saving...' : 'שמור'}
      </button>
      {updateProjectMutation.isError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded">
          Error saving:{' '}
          {updateProjectMutation.error instanceof Error
            ? updateProjectMutation.error.message
            : 'Unknown error'}
        </div>
      )}
      <ToolCredentials />
      <ProjectMembers />
    </div>
  );
};

const ProjectManagement = () => {
  return (
    <ProjectManagementProvider>
      <ProjectContent />
    </ProjectManagementProvider>
  );
};

export default ProjectManagement;
