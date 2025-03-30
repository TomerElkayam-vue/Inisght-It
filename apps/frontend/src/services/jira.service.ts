import { api } from "./api.config";

export type IssuesCountResponse = Record<string, number>;

export const getIssuesCount = async (): Promise<IssuesCountResponse> => {
  const response = await api.get<IssuesCountResponse>("/jira/issues-count");
  return response.data;
};
