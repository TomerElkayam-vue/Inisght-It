import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JiraRepository } from './jira.repository';
import { JiraSprintDto } from './dto/jira-sprint.dto';
import { JiraIssueCountDto } from './dto/jira-issue-count';
import { ProjectsSerivce } from '../projects/project.service';
import { EmployeeService } from '../employee/employee.service';
import { JiraSettings } from './types/jira-settings.type';

@Injectable()
export class JiraService {
  constructor(
    private readonly jiraRepository: JiraRepository,
    private projectsService: ProjectsSerivce,
    private readonly employeeService: EmployeeService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getJiraIssues(jiraSettings: JiraSettings) {
    const cacheKey = 'jira-issues';
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      console.log('Nice cache');
    }

    const issues = await this.jiraRepository.getJiraIssues(jiraSettings);
    await this.cacheManager.set(cacheKey, issues, 300000); // Cache for 5 minutes
    return issues;
  }

  async getJiraSprints(jiraSettings: JiraSettings) {
    console.log(jiraSettings);
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

  async countJiraIssuesBySprintPerUser(
    jiraSettings: JiraSettings
  ): Promise<JiraIssueCountDto[]> {
    const cacheKey = 'jira-issues-count';
    const cachedData = await this.cacheManager.get<JiraIssueCountDto[]>(
      cacheKey
    );

    if (cachedData) {
      console.log('Fuck cache');
    }

    const sprints = await this.getJiraSprints(jiraSettings);
    const blankStats = sprints.reduce((acc, curr) => {
      acc[curr.name] = 0;
      return acc;
    }, {} as Record<string, number>);

    const issues = (await this.getJiraIssues(jiraSettings)) as Array<{
      fields: { assignee?: { displayName: string }; sprint?: { name: string } };
    }>;
    const issueCounts: JiraIssueCountDto[] = [];

    issues.forEach(
      (issue: {
        fields: {
          assignee?: { displayName: string };
          sprint?: { name: string };
        };
      }) => {
        const assignee: string =
          issue.fields.assignee?.displayName || 'Unassigned';
        const sprint: string = issue.fields.sprint?.name || 'Backlog';

        let currUser = issueCounts.find((o) => o.name == assignee);

        if (!currUser) {
          currUser = { name: assignee, stats: structuredClone(blankStats) };
          issueCounts.push(currUser);
        }

        currUser.stats[sprint]++;
      }
    );

    //TODO: when getting project id select only the workers in current project (and not a new request to eche worker)

    const issueCountsWithUsername = await Promise.all(
      issueCounts.map(async ({ name, stats }) => {
        const employee = await this.employeeService.findEmployeeByJiraUsername(
          name
        );
        return {
          name: employee?.displayName ?? name,
          stats,
        };
      })
    );

    await this.cacheManager.set(cacheKey, issueCountsWithUsername, 300000);
    return issueCountsWithUsername;
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
