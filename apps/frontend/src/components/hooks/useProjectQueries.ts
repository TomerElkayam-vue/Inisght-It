import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { Project, ProjectUpdateInput } from '@packages/projects';
import { projectsService } from '../../services/projects.service';
// Keys for query caching
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: any) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// Hook for fetching multiple projects
export const useProjects = (userId = '') => {
  return useQuery({
    queryKey: [...projectKeys.lists(), userId],
    queryFn: projectsService.getProjects,
  });
};

// Hook for fetching a single project
export const useProject = (id?: string): UseQueryResult<Project, Error> => {
  return useQuery({
    queryKey: projectKeys.detail(id || ''),
    queryFn: () =>
      id
        ? projectsService.getProject(id)
        : Promise.reject('No project ID provided'),
    enabled: !!id,
  });
};

// Hook for creating a new project
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProject: Omit<Project, 'id' | 'createdAt'>) =>
      projectsService.createProject(newProject),
    onSuccess: () => {
      // Invalidate the projects list query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

// Hook for updating a project
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdateInput }) =>
      projectsService.updateProject(id, data),
    onSuccess: (updatedProject) => {
      // Update both the list and the individual project in the cache
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(updatedProject.id),
      });
    },
  });
};

// Hook for deleting a project
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsService.deleteProject(id),
    onSuccess: (_data, id) => {
      // Remove the deleted project from the cache and invalidate the list
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};
