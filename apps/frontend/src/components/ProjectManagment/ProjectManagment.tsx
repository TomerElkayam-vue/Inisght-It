import { Project } from '@packages/projects';
import ProjectMembers from './ProjectMembers';
import ToolCredentials from './ToolsCredentials';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { projectKeys, useUpdateProject } from '../hooks/useProjectQueries';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { useCurrentConnectedUser } from '../../context/CurrentConnectedUserContext';
import {
  ProjectManagementProvider,
  useProjectManagementContext,
} from '../../context/ProjectManagementContext';

const ProjectContent = () => {
  const { currentProject, setCurrentProject } = useCurrentProjectContext();
  const {
    members,
    setMembers,
    setCodeBaseCredentials,
    setManagementCredentials,
  } = useProjectManagementContext();

  const updateProjectMutation = useUpdateProject();

  const [isSaving, setIsSaving] = useState(false);

  const queryClient = useQueryClient();
  const { user } = useCurrentConnectedUser();
  const projects =
    queryClient.getQueryData<Project[]>([...projectKeys.lists(), user?.id]) ||
    [];

  useEffect(() => {
    if (projects && projects.length > 0 && currentProject) {
      const currentProjectId = projects.find(
        (project) => project.id === currentProject.id
      );
      if (currentProjectId) {
        setCurrentProject(currentProjectId);
      }
    }
  }, [projects]);

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

        setMembers(memberEmployees);
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
          ...members.map((member) => ({
            userId: member.id,
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center gap-8 bg-[#1e1e2f] text-white relative">
      {updateProjectMutation.isError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded">
          Error saving:{' '}
          {updateProjectMutation.error instanceof Error
            ? updateProjectMutation.error.message
            : 'Unknown error'}
        </div>
      )}
      <ToolCredentials />
      <ProjectMembers save={handleSave} disableSave={isSaving} />
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
