import { api } from './api.config';
import { UserSpecificStats } from '@packages/github';

export const getPullRequestsSummery = async (): Promise<
  UserSpecificStats[]
> => {
  const response = await api.get<UserSpecificStats[]>(
    '/github/TomerElkayam-vue/Inisght-It/project-stats'
  );
  return response.data;
};
