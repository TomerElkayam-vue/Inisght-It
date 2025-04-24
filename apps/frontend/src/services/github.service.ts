import { UserActivity } from '../types/github-activity';
import { api } from './api.config';

export const getPullRequestsSummery = async (): Promise<UserActivity[]> => {
  const response = await api.get<UserActivity[]>(
    '/github/TomerElkayam-vue/Inisght-It/project-stats'
  );
  return response.data;
};
