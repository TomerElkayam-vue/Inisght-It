import { api } from "./api.config";

export type IssuesCountResponse = [{
  name: string;
  stats: Record<string, number>;
}];

export type SprintResponse = string[];

export const getIssuesCount = async (projectId: string): Promise<IssuesCountResponse> => {
  const response = await api.get<IssuesCountResponse>(`/jira/issues-count-by-sprint?projectId=${projectId}`);
  return response.data;
};

export const getSprints = async (projectId: string): Promise<SprintResponse> => {
  const response = await api.get(`/jira/sprints?projectId=${projectId}`);
  return response.data.map((sprint: { name: string; }) => sprint.name);
};
