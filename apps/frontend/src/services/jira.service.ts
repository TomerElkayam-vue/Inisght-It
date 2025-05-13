import { api } from "./api.config";

export type IssuesCountResponse = [{
  name: string;
  stats : Record<string,number>;
}];

export type SprintResponse = string[];

export const getIssuesCount = async (projectId = "5189c957-1d16-4880-9e7c-2eec4667dbf2"): Promise<IssuesCountResponse> => {
  const response = await api.get<IssuesCountResponse>(`/jira/issues-count-by-sprint?projectId=${projectId}`);
  return response.data;
};

export const getSprints = async (projectId = "5189c957-1d16-4880-9e7c-2eec4667dbf2"): Promise<SprintResponse> => {
  const response = await api.get(`/jira/sprints?projectId=${projectId}`);
  return response.data.map((sprint: { name: string; }) => sprint.name);
};
