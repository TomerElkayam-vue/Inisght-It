import { api } from './api.config';
import { SprintCommentsPerUser } from '@packages/github';

export const getPullRequestsSummery = async (projectId: string): Promise<
  SprintCommentsPerUser[]
> => {
  const response = await api.get<SprintCommentsPerUser[]>(
    `/github/TomerElkayam-vue/Inisght-It/project-stats?projectId=${projectId}`
  );
  return response.data;
};
