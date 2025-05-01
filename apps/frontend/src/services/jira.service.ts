import { api } from "./api.config";

export type IssuesCountResponse = [{
  name: string;
  stats : Record<string,number>;
}];
export type SprintResponse = string[];

export const getIssuesCount = async (): Promise<IssuesCountResponse> => {
  const response = await api.get<IssuesCountResponse>("/jira/issues-count-by-sprint");
  return response.data;
};

export const getSprints = async (): Promise<SprintResponse> => {
  const response = await api.get("/jira/sprints");
  return response.data.map((sprint: { name: string; }) => sprint.name);
};
