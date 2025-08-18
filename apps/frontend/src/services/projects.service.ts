import { api } from './api.config';

import { Project, ProjectUpdateInput } from '@packages/projects';

export const projectsService = {
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>(`/projects/user`);
    return response.data;
  },

  getProject: async (id: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  createProject: async (
    project: Omit<Project, 'id' | 'createdAt' | 'employees'>
  ): Promise<Project> => {
    const response = await api.post<Project>('/projects', project);
    return response.data;
  },

  updateProject: async (
    id: string,
    project: ProjectUpdateInput
  ): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, project);
    return response.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};
