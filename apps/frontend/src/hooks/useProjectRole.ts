import { Project } from '@packages/projects';
import { User } from "../context/CurrentConnectedUserContext";

export type ProjectRole = 'OWNER' | 'MEMBER' | null;

export const useProjectRole = (
  currentProject: Project | null,
  user: User | null
) => {
  if (!currentProject || !user) {
    return null;
  }

  const permission = currentProject.projectPermissions?.find(
    (p) => p.userId === user.id
  );

  if (!permission) {
    return null;
  }

  return permission.roleId === 1 ? 'OWNER' : 'MEMBER';
};
