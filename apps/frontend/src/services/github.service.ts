import { api } from './api.config';
import { SprintCommentsPerUser, UserSpecificStats } from '@packages/github';

export const getPullRequestsSummery = async (): Promise<
  SprintCommentsPerUser[]
> => {
  const response = await api.get<SprintCommentsPerUser[]>(
    '/github/TomerElkayam-vue/Inisght-It/project-stats'
  );
  return response.data;
};
