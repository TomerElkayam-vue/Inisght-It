import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JiraRepository } from './jira.repository';
import { JiraSprintDto } from './dto/jira-sprint.dto';
import { JiraIssueCountDto } from './dto/jira-issue-count';
import { ProjectsSerivce } from '../projects/project.service';
import { EmployeeService } from '../employee/employee.service';

@Injectable()
export class JiraService {
  constructor(
    private readonly jiraRepository: JiraRepository,
    private projectsService: ProjectsSerivce,
    private readonly employeeService: EmployeeService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getJiraIssues() {
    const cacheKey = 'jira-issues';
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const issues = await this.jiraRepository.getJiraIssues({
      id: 'e8b88b3a-e6f8-429b-8cd9-312a1940a176',
      name: 'insightit',
      token:
        'eyJraWQiOiJhdXRoLmF0bGFzc2lhbi5jb20tQUNDRVNTLTk0ZTczYTkwLTUxYWQtNGFjMS1hOWFjLWU4NGUwNDVjNDU3ZCIsImFsZyI6IlJTMjU2In0.eyJqdGkiOiJkYzJlZjUwNS0zMDI4LTRkYWUtOTQ4Yy0wMzlmOWZiY2Y3ZGIiLCJzdWIiOiI2MjkwNmM5N2M2NWI3MjAwNjk2Mzg5ZmYiLCJuYmYiOjE3NDc3NTQ4MzksImlzcyI6Imh0dHBzOi8vYXV0aC5hdGxhc3NpYW4uY29tIiwiaWF0IjoxNzQ3NzU0ODM5LCJleHAiOjE3NDc3NTg0MzksImF1ZCI6IkF0NmVqYkFGTWtBVWRTSjI1WGZiTUxTSmlNTHB4VkhlIiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRFbWFpbCI6ImNkYTM5NjMyLThlMDgtNGM1Mi1hMDZmLTA3NGIwYmI1YjNlNEBjb25uZWN0LmF0bGFzc2lhbi5jb20iLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vc2Vzc2lvbl9pZCI6Ijk4YWUxMmYxLWI5NDUtNDQ3Ny1hOTdkLTZkM2I4NzkxMTc4NCIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9hdGxfdG9rZW5fdHlwZSI6IkFDQ0VTUyIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9maXJzdFBhcnR5IjpmYWxzZSwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3ZlcmlmaWVkIjp0cnVlLCJjbGllbnRfaWQiOiJBdDZlamJBRk1rQVVkU0oyNVhmYk1MU0ppTUxweFZIZSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9zeXN0ZW1BY2NvdW50SWQiOiI3MTIwMjA6NDY5ZWVlNTQtZGQxMS00NTdlLWIyMDQtN2VkZDdlNTM2YTcwIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3Byb2Nlc3NSZWdpb24iOiJ1cy1lYXN0LTEiLCJzY29wZSI6InJlYWQ6Ym9hcmQtc2NvcGUuYWRtaW46amlyYS1zb2Z0d2FyZSByZWFkOmJvYXJkLXNjb3BlOmppcmEtc29mdHdhcmUgcmVhZDppc3N1ZS1kZXRhaWxzOmppcmEgcmVhZDpqaXJhLXVzZXIgcmVhZDpqaXJhLXdvcmsgcmVhZDpwcm9qZWN0OmppcmEgcmVhZDpzcHJpbnQ6amlyYS1zb2Z0d2FyZSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9lbWFpbERvbWFpbiI6ImdtYWlsLmNvbSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS8zbG8iOnRydWUsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiIwZjFhYTYzZS1hYTZjLTRlNTEtYTNlNy0zM2MzNmFjYzEyZGQiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9vYXV0aENsaWVudElkIjoiQXQ2ZWpiQUZNa0FVZFNKMjVYZmJNTFNKaU1McHhWSGUiLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudEVtYWlsRG9tYWluIjoiY29ubmVjdC5hdGxhc3NpYW4uY29tIn0.Ao4wy4vcFF3f4hDlWVZBMZrdZGpIOgb44amHul2U8UR5MYqw9B__En1Z8G70J7l9fjfFSmAqaJ1K2aqvgMU_pAEelOTWrTzMiU2HREH0OY48tUbWbbTGcFmO_iPv4FPOuM4ajoRfpuQhGlS_iQOb6RV1r0Jw4W9BBafpqZBPzUmTXFPRu0HP9EOX4yn_xerLeaOvCo61otgw-4gnZ68b4B5f2AJGzRkIniWXnGCxyP83ZlzjWS-J41y5iATsQHNdTeNhi0RejTuovIq7yTO2NUgejU23zqXABHdy_Z-2Q__uGNTDSUjvPpiuRbEupjbetLELSq57QvfUCWXOXSeXiA',
    });
    await this.cacheManager.set(cacheKey, issues, 300000); // Cache for 5 minutes
    return issues;
  }

  async getJiraSprints() {
    const cacheKey = 'jira-sprints';
    const cachedData = await this.cacheManager.get<JiraSprintDto[]>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const jiraSprints = await this.jiraRepository.getJiraSprints({
      id: 'e8b88b3a-e6f8-429b-8cd9-312a1940a176',
      name: 'insightit',
      token:
        'eyJraWQiOiJhdXRoLmF0bGFzc2lhbi5jb20tQUNDRVNTLTk0ZTczYTkwLTUxYWQtNGFjMS1hOWFjLWU4NGUwNDVjNDU3ZCIsImFsZyI6IlJTMjU2In0.eyJqdGkiOiJkYzJlZjUwNS0zMDI4LTRkYWUtOTQ4Yy0wMzlmOWZiY2Y3ZGIiLCJzdWIiOiI2MjkwNmM5N2M2NWI3MjAwNjk2Mzg5ZmYiLCJuYmYiOjE3NDc3NTQ4MzksImlzcyI6Imh0dHBzOi8vYXV0aC5hdGxhc3NpYW4uY29tIiwiaWF0IjoxNzQ3NzU0ODM5LCJleHAiOjE3NDc3NTg0MzksImF1ZCI6IkF0NmVqYkFGTWtBVWRTSjI1WGZiTUxTSmlNTHB4VkhlIiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRFbWFpbCI6ImNkYTM5NjMyLThlMDgtNGM1Mi1hMDZmLTA3NGIwYmI1YjNlNEBjb25uZWN0LmF0bGFzc2lhbi5jb20iLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vc2Vzc2lvbl9pZCI6Ijk4YWUxMmYxLWI5NDUtNDQ3Ny1hOTdkLTZkM2I4NzkxMTc4NCIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9hdGxfdG9rZW5fdHlwZSI6IkFDQ0VTUyIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9maXJzdFBhcnR5IjpmYWxzZSwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3ZlcmlmaWVkIjp0cnVlLCJjbGllbnRfaWQiOiJBdDZlamJBRk1rQVVkU0oyNVhmYk1MU0ppTUxweFZIZSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9zeXN0ZW1BY2NvdW50SWQiOiI3MTIwMjA6NDY5ZWVlNTQtZGQxMS00NTdlLWIyMDQtN2VkZDdlNTM2YTcwIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3Byb2Nlc3NSZWdpb24iOiJ1cy1lYXN0LTEiLCJzY29wZSI6InJlYWQ6Ym9hcmQtc2NvcGUuYWRtaW46amlyYS1zb2Z0d2FyZSByZWFkOmJvYXJkLXNjb3BlOmppcmEtc29mdHdhcmUgcmVhZDppc3N1ZS1kZXRhaWxzOmppcmEgcmVhZDpqaXJhLXVzZXIgcmVhZDpqaXJhLXdvcmsgcmVhZDpwcm9qZWN0OmppcmEgcmVhZDpzcHJpbnQ6amlyYS1zb2Z0d2FyZSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9lbWFpbERvbWFpbiI6ImdtYWlsLmNvbSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS8zbG8iOnRydWUsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiIwZjFhYTYzZS1hYTZjLTRlNTEtYTNlNy0zM2MzNmFjYzEyZGQiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9vYXV0aENsaWVudElkIjoiQXQ2ZWpiQUZNa0FVZFNKMjVYZmJNTFNKaU1McHhWSGUiLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudEVtYWlsRG9tYWluIjoiY29ubmVjdC5hdGxhc3NpYW4uY29tIn0.Ao4wy4vcFF3f4hDlWVZBMZrdZGpIOgb44amHul2U8UR5MYqw9B__En1Z8G70J7l9fjfFSmAqaJ1K2aqvgMU_pAEelOTWrTzMiU2HREH0OY48tUbWbbTGcFmO_iPv4FPOuM4ajoRfpuQhGlS_iQOb6RV1r0Jw4W9BBafpqZBPzUmTXFPRu0HP9EOX4yn_xerLeaOvCo61otgw-4gnZ68b4B5f2AJGzRkIniWXnGCxyP83ZlzjWS-J41y5iATsQHNdTeNhi0RejTuovIq7yTO2NUgejU23zqXABHdy_Z-2Q__uGNTDSUjvPpiuRbEupjbetLELSq57QvfUCWXOXSeXiA',
    });
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

  async countJiraIssuesBySprintPerUser(): Promise<JiraIssueCountDto[]> {
    const cacheKey = 'jira-issues-count';
    const cachedData = await this.cacheManager.get<JiraIssueCountDto[]>(
      cacheKey
    );

    if (cachedData) {
      return cachedData;
    }

    const sprints = await this.getJiraSprints();
    const blankStats = sprints.reduce((acc, curr) => {
      acc[curr.name] = 0;
      return acc;
    }, {} as Record<string, number>);

    const issues = (await this.getJiraIssues()) as Array<{
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

  async getJiraProjects(projectId: string) {
    const token = //@ts-ignore
      (
        (await this.projectsService.getProject({ id: projectId }))
          ?.missionManagementCredentials as any
      )?.token;

    return this.jiraRepository.getJiraProjects(token);
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
