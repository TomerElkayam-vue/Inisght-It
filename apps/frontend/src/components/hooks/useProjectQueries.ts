import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { Project, ProjectUpdateInput } from '@packages/projects';
import { projectsService } from '../../services/projects.service';
import { ApiOperation } from '@nestjs/swagger';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: any) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export const useProjects = (userId = '', options = {}) => {
  return useQuery({
    queryKey: [...projectKeys.lists(), userId],
    queryFn: projectsService.getProjects,
    enabled: !!userId, // only run if userId exists
    ...options,
  });
};

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

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProject: Omit<Project, 'id' | 'createdAt' | 'employees'>) =>
      projectsService.createProject(newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdateInput }) =>
      projectsService.updateProject(id, data),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(updatedProject.id),
      });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsService.deleteProject(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};
