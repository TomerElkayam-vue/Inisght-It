import { JiraDataType } from '../components/Stats/JiraDashboard';
import { api } from './api.config';

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
