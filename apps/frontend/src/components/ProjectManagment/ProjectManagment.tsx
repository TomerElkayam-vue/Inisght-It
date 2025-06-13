import { useMemo, useState } from 'react';
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
    setCodeBaseCredentials,
    setManagementCredentials,
  } = useProjectManagementContext();

  const updateProjectMutation = useUpdateProject();

  const [isSaving, setIsSaving] = useState(false);

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
      setIsSaving(true);
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
          projectPermissions: projectPermissions,
        },
      });

      setTimeout(() => setIsSaving(false), 1000);
    } catch (err) {
      console.error('Error updating project:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gap-8 bg-[#1e1e2f] text-white relative">
      {updateProjectMutation.isError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded">
          Error saving:{' '}
          {updateProjectMutation.error instanceof Error
            ? updateProjectMutation.error.message
            : 'Unknown error'}
        </div>
      )}
      <ToolCredentials />
      <ProjectMembers
        save={handleSave}
        disableSave={isSaving}
      />
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
