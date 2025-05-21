import { api } from './api.config';

import { Project } from '@packages/projects';

export const projectsService = {
  getProjects: async (userId: string): Promise<Project[]> => {
    const response = await api.get<Project[]>(`/projects/user/${userId}`);
    return response.data;
  },

  getProject: async (id: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  createProject: async (
    project: Omit<Project, 'id' | 'createdAt'>
  ): Promise<Project> => {
    const response = await api.post<Project>('/projects', project);
    return response.data;
  },

  updateProject: async (
    id: string,
    project: Partial<Project>
  ): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, project);
    return response.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};
