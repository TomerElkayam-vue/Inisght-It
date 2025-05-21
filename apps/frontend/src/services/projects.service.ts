import { api } from './api.config';

import { Project } from '@packages/projects';

export const projectsService = {
  getProjects: async (): Promise<Project[]> => {
    const token = localStorage.getItem('jwt_token'); // Retrieve the token from localStorage
    if (!token) {
      throw new Error('User is not authenticated. Token is missing.');
    }

    const response = await api.get<Project[]>(`/projects/user`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
    });
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
