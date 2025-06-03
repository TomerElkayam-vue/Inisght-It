import { api } from './api.config';
import { SprintCommentsPerUser } from '@packages/github';

export enum GithubDataType {
  PR = 'PR',
  COMMITS = 'COMMITS',
  FILE_CHANGES = 'FILE_CHANGES',
  COMMENTS = 'COMMENTS',
}

export const getPullRequestsSummery = async (projectId: string): Promise<
  SprintCommentsPerUser[]
> => {
  const response = await api.get<SprintCommentsPerUser[]>(
    `/github/project-stats?projectId=${projectId}`
  );
  return response.data;
};

export const getUsersRepositories = async (projectId: string): Promise<{id: string, name: string, owner: string}[]
> => {
  const response = await api.get<{id: string, name: string, owner: string}[]>(
    `/github/users/repos?projectId=${projectId}`
  );
  return response.data;
};

export const updateGithubProject = async (
  projectId: string,
  codeRepositoryCredentials: any
) => {
  await api.post(
    `/github/update-github-project?projectId=${projectId}`,
    codeRepositoryCredentials
  );
};

export const getGithubStats = async (
  projectId: string,
  statType: GithubDataType,
  teamStats: boolean
): Promise<Record<string, Record<string, any>>> => {
  const response = await api.get<Record<string, Record<string, any>>>(
    `/github/stats/${statType}?projectId=${projectId}${
      teamStats ? '&teamStats=true' : ''
    }`
  );
  return response.data;
};
