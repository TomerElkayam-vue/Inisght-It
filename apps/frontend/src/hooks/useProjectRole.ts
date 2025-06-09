import { useCurrentProjectContext } from '../context/CurrentProjectContext';
import { useCurrentConnectedUser } from '../context/CurrentConnectedUserContext';

export type ProjectRole = 'OWNER' | 'MEMBER' | null;

export const useProjectRole = () => {
  const { currentProject } = useCurrentProjectContext();
  const { user } = useCurrentConnectedUser();

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
