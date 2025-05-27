import { Injectable } from '@nestjs/common';
import { JiraRepository } from './jira.repository';
import { JiraSprintDto } from './dto/jira-sprint.dto';
import { ProjectsSerivce } from '../projects/project.service';
import { EmployeeService } from '../employee/employee.service';
import { JiraSettings } from './types/jira-settings.type';
import { JiraUserStatsDTO } from './dto/jira-issue-count';
import { JiraDataType } from './enums/jira-data-type.enum';
import { JiraDtoTransformationMapper } from './mappers/jira-dto-transformation-mapper';

@Injectable()
export class JiraService {
  constructor(
    private readonly jiraRepository: JiraRepository,
    private projectsService: ProjectsSerivce,
    private readonly employeeService: EmployeeService
  ) {}

  private async executeWithRefresh<T>(
    jiraSettings: JiraSettings,
    projectId: string,
    operation: (settings: JiraSettings) => Promise<T>
  ): Promise<T> {
    try {
      return await operation(jiraSettings);
    } catch (err: any) {
      if (err.status === 401 || err.response?.status === 401) {
        console.log('Refreshing Jira token...');
        const newToken = await this.refreshJiraToken(
          jiraSettings.refreshToken,
          projectId
        );
        const updatedSettings = { ...jiraSettings, token: newToken };
        return await operation(updatedSettings);
      }
      throw err;
    }
  }

  async getJiraIssues(
    jiraSettings: JiraSettings,
    jiraDataType: JiraDataType,
    projectId: string
  ) {
    return this.executeWithRefresh(jiraSettings, projectId, (settings) =>
      this.jiraRepository.getJiraIssues(settings, jiraDataType)
    );
  }

  async getJiraSprints(jiraSettings: JiraSettings, projectId: string) {
    const jiraSprints = await this.executeWithRefresh(
      jiraSettings,
      projectId,
      (settings) => this.jiraRepository.getJiraSprints(settings)
    );

    return jiraSprints.map(
      (sprint: any): JiraSprintDto => ({
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate ?? null,
        endDate: sprint.endDate ?? null,
        state: sprint.state,
      })
    );
  }

  async countJiraStatsPerUser(
    jiraSettings: JiraSettings,
    jiraDataType: JiraDataType,
    projectId: string
  ): Promise<JiraUserStatsDTO> {
    const sprints = await this.getJiraSprints(jiraSettings, projectId);
    const blankStats = sprints.reduce((acc, curr) => {
      acc[curr.name] =
        JiraDtoTransformationMapper[jiraDataType].sprintInitaliztionValue;
      return acc;
    }, {} as Record<string, any>);

    const issues = await this.getJiraIssues(
      jiraSettings,
      jiraDataType,
      projectId
    );
    const issueCounts: JiraUserStatsDTO = {};

    issues?.forEach(async (fields: any) => {
      const assignee: string = fields.assignee?.displayName || 'Unassigned';
      const sprint: string = fields.sprint?.name || 'Backlog';

      if (!issueCounts[assignee]) {
        issueCounts[assignee] = structuredClone(blankStats);
      }

      if (issueCounts[assignee][sprint] !== undefined) {
        issueCounts[assignee][sprint] = JiraDtoTransformationMapper[
          jiraDataType
        ].dataTransformation(
          structuredClone(issueCounts[assignee][sprint]),
          fields
        );
      }
    });

    return this.getStatsWithEmployeesUsername(issueCounts);
  }

  async countJiraStatsPerSprint(
    jiraSettings: JiraSettings,
    jiraDataType: JiraDataType,
    projectId: string
  ): Promise<JiraUserStatsDTO> {
    const sprints = await this.getJiraSprints(jiraSettings, projectId);

    const issues = await this.getJiraIssues(
      jiraSettings,
      jiraDataType,
      projectId
    );
    const issueCounts: JiraUserStatsDTO = {};

    sprints.forEach(
      (sprint) =>
        (issueCounts[sprint.name] =
          JiraDtoTransformationMapper[jiraDataType].sprintInitaliztionValue)
    );

    issues?.forEach(async (fields: any) => {
      const sprint: string = fields.sprint?.name || 'Backlog';

      if (issueCounts[sprint] !== undefined) {
        issueCounts[sprint] = JiraDtoTransformationMapper[
          jiraDataType
        ].dataTransformation(structuredClone(issueCounts[sprint]), fields);
      }
    });

    return issueCounts;
  }

  async getStatsWithEmployeesUsername(
    stats: JiraUserStatsDTO
  ): Promise<JiraUserStatsDTO> {
    const entries = await Promise.all(
      Object.entries(stats).map(async ([username, value]) => {
        const employee = await this.employeeService.findEmployeeByJiraUsername(
          username
        );
        const displayName = employee?.displayName ?? username;
        return [displayName, value] as [string, typeof value];
      })
    );

    return Object.fromEntries(entries);
  }

  async getJiraToken(code: string, projectId: string) {
    const { accessToken, refreshToken } =
      await this.jiraRepository.getJiraToken(code);
    await this.projectsService.updateProject({
      where: { id: projectId },
      data: {
        missionManagementCredentials: { token: accessToken, refreshToken },
      },
    });
  }

  async refreshJiraToken(
    currentRefreshToken: string,
    projectId: string
  ): Promise<string> {
    const { accessToken, refreshToken } =
      await this.jiraRepository.refreshJiraToken(currentRefreshToken);
    const currentMissionManagmentSettings = (
      await this.projectsService.getProject({ id: projectId })
    )?.missionManagementCredentials as any;

    await this.projectsService.updateProject({
      where: { id: projectId },
      data: {
        missionManagementCredentials: {
          ...currentMissionManagmentSettings,
          token: accessToken,
          refreshToken,
        },
      },
    });

    return accessToken;
  }

  async getJiraProjects(jiraSettings: JiraSettings, projectId: string) {
    return this.executeWithRefresh(jiraSettings, projectId, (settings) =>
      this.jiraRepository.getJiraProjects(settings.token)
    );
  }

  async getJiraRawIssues(jiraSettings: JiraSettings, projectId: string) {
    return this.executeWithRefresh(jiraSettings, projectId, (settings) =>
      this.jiraRepository.getJiraIssues(settings, JiraDataType.ISSUES)
    );
  }

  async getJiraIssueChangelog(
    issueId: string,
    jiraSettings: JiraSettings,
    projectId: string
  ) {
    return this.executeWithRefresh(jiraSettings, projectId, (settings) =>
      this.jiraRepository.getIssueChangelog(issueId, settings)
    );
  }

  async updateJiraProjectOnProject(
    projectId: string,
    jiraProject: { projectName: string; projectId: string }
  ) {
    const currentMissionManagmentSettings = (
      await this.projectsService.getProject({ id: projectId })
    )?.missionManagementCredentials as any;

    const settings = {
      ...currentMissionManagmentSettings,
      name: jiraProject.projectName,
      id: jiraProject.projectId,
    };

    await this.projectsService.updateProject({
      where: { id: projectId },
      data: { missionManagementCredentials: settings },
    });
  }
}
