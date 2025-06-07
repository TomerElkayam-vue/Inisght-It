import { api } from './api.config';

export enum JiraDataType {
  ISSUES = 'ISSUES',
  STORY_POINTS = 'STORY_POINTS',
  ISSUE_STATUS = 'ISSUE_STATUS',
  ISSUE_TYPE = 'ISSUE_TYPE',
}

export type IssuesCountResponse = [
  {
    name: string;
    stats: Record<string, number>;
  }
];
export type SprintResponse = string[];

export const getJiraStats = async (
  projectId: string,
  statType: JiraDataType,
  teamStats: boolean
): Promise<Record<string, Record<string, any>>> => {
  const response = await api.get<Record<string, Record<string, any>>>(
    `/jira/stats/${statType}?projectId=${projectId}${
      teamStats ? `&teamStats=true` : ''
    }`
  );
  return response.data;
};

export const getSprints = async (
  projectId: string
): Promise<SprintResponse> => {
  const response = await api.get(`/jira/sprints?projectId=${projectId}`);
  return response.data.map((sprint: { name: string }) => sprint.name);
};

export const getDetailedSprints = async (projectId: string): Promise<any> => {
  const response = await api.get(`/jira/sprints?projectId=${projectId}`);
  return response.data;
};

export const getSprintsIssuesChangelog = async (
  projectId: string,
  sprintId: string
): Promise<any> => {
  const response = await api.get(
    `/jira/issues-with-merge-requests/${sprintId}?projectId=${projectId}`
  );
  return response.data;
};

export const getProjects = async (projectId: string): Promise<any> => {
  const response = await api.get(`/jira/projects?projectId=${projectId}`);
  return response.data;
};

export const updateJiraProjectOnProject = async (
  projectId: string,
  selectedJiraProject: { projectName: string; projectId: string }
) => {
  await api.post(
    `/jira/update-jira-project?projectId=${projectId}`,
    selectedJiraProject
  );
};
