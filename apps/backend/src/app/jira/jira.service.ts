import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
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
    private readonly employeeService: EmployeeService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getJiraIssues(jiraSettings: JiraSettings, jiraDataType: JiraDataType) {
    const issues = await this.jiraRepository.getJiraIssues(
      jiraSettings,
      jiraDataType
    );

    return issues;
  }

  async getJiraSprints(jiraSettings: JiraSettings) {
    const cacheKey = 'jira-sprints';
    const cachedData = ''; // await this.cacheManager.get<JiraSprintDto[]>(cacheKey);

    if (cachedData) {
      console.log('Nice cache');
    }

    const jiraSprints = await this.jiraRepository.getJiraSprints(jiraSettings);
    const mappedSprints = jiraSprints.map(
      (sprint: any): JiraSprintDto => ({
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate ?? null,
        endDate: sprint.endDate ?? null,
        state: sprint.state,
      })
    );

    await this.cacheManager.set(cacheKey, mappedSprints, 300000); // Cache for 5 minutes
    return mappedSprints;
  }

  async countJiraStatsPerUser(
    jiraSettings: JiraSettings,
    jiraDataType: JiraDataType
  ): Promise<JiraUserStatsDTO> {
    const sprints = await this.getJiraSprints(jiraSettings);
    const blankStats = sprints.reduce((acc, curr) => {
      acc[curr.name] =
        JiraDtoTransformationMapper[jiraDataType].sprintInitaliztionValue;
      return acc;
    }, {} as Record<string, any>);

    const issues = await this.getJiraIssues(jiraSettings, jiraDataType);
    const issueCounts: JiraUserStatsDTO = {};

    issues.forEach(async (fields: any) => {
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
    jiraDataType: JiraDataType
  ): Promise<JiraUserStatsDTO> {
    const sprints = await this.getJiraSprints(jiraSettings);

    const issues = await this.getJiraIssues(jiraSettings, jiraDataType);
    const issueCounts: JiraUserStatsDTO = {};

    sprints.forEach(
      (sprint) =>
        (issueCounts[sprint.name] =
          JiraDtoTransformationMapper[jiraDataType].sprintInitaliztionValue)
    );

    issues.forEach(async (fields: any) => {
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
    const token = await this.jiraRepository.getJiraToken(code);
    await this.projectsService.updateProject({
      where: { id: projectId },
      data: {
        missionManagementCredentials: { token },
      },
    });
  }

  async getJiraProjects(jiraSettings: JiraSettings) {
    return this.jiraRepository.getJiraProjects(jiraSettings.token);
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
