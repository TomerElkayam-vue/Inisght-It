import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GithubRepository } from './github.reposetory';
import { ProjectsSerivce } from '../projects/project.service';
import {
  GitHubPullRequest,
  GitHubPullRequestFiles,
  RepositoryContributor,
} from '@packages/github';
import { JiraService } from '../jira/jira.service';
import { EmployeeService } from '../employee/employee.service';
import { JiraSprintDto } from '../jira/dto/jira-sprint.dto';
import { GithubDtoTransformationMapper } from './mappers/github-dto-transformation-mapper';
import { GithubDataType } from './enums/github-data-type';
import { GithubAvgDataType } from './enums/github-avg-data-type';
import { AvgStats } from '@packages/projects';
import {
  getTopBlindSpotsInCode,
  sumPRChangesPoints,
} from './utils/code-blind-spot-utils';

@Injectable()
export class GithubService {
  constructor(
    private readonly GithubRepository: GithubRepository,
    private projectsService: ProjectsSerivce,
    @Inject(forwardRef(() => JiraService))
    private readonly jiraService: JiraService,
    @Inject(forwardRef(() => EmployeeService))
    private readonly employeeService: EmployeeService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getRepositoryContributors(
    owner: string,
    repo: string,
    token: string
  ): Promise<RepositoryContributor[]> {
    return this.GithubRepository.getRepositoryContributors(owner, repo, token);
  }

  async getUserGithubToken(code: string, projectId: string) {
    const token = await this.GithubRepository.getUserGithubToken(code);
    await this.projectsService.updateProject({
      where: { id: projectId },
      data: {
        codeRepositoryCredentials: { token },
      },
    });
    return token;
  }

  async getUsersRepositories(token: string) {
    return this.GithubRepository.getUsersRepositories(token);
  }

  async getAllPullRequests(codeRepositoryCredentials: any) {
    const { name, owner, token } = codeRepositoryCredentials;
    const data = await this.GithubRepository.getAllPullRequests(
      owner,
      name,
      token
    );
    return data.map((pullRequest) => ({
      title: pullRequest.title,
      owner: pullRequest.user?.login,
      createdAt: pullRequest.created_at,
      mergedAt: (pullRequest as unknown as any).merged_at,
    }));
  }

  async updateGithubProjectOnProject(
    projectId: string,
    githubProject: { id: string; name: string; owner: string }
  ) {
    const currentProject = await this.projectsService.getProject({
      id: projectId,
    });
    if (!currentProject) {
      throw new Error('Project not found');
    }

    const currentCodeRepositoryCredentials =
      currentProject.codeRepositoryCredentials as any;
    if (!currentCodeRepositoryCredentials?.token) {
      throw new Error('GitHub token not found. Please reconnect GitHub.');
    }

    const settings = {
      ...currentCodeRepositoryCredentials,
      ...githubProject,
    };

    await this.projectsService.updateProject({
      where: { id: projectId },
      data: { codeRepositoryCredentials: settings },
    });
  }

  async getAllChangedFilesByUser(owner: string, name: string, token: string) {
    const cacheKey = `project-pulls-${owner}-${name}-files`;

    const pullRequests = await this.GithubRepository.getPullRequests(
      owner,
      name,
      token,
      null,
      null,
      'all'
    );

    const files = (
      await Promise.all(
        pullRequests.map(async (pullRequest) =>
          this.GithubRepository.getChangedFilesByPullRequestNumber(
            owner,
            name,
            token,
            pullRequest
          )
        )
      )
    ).flat();

    await this.cacheManager.set(cacheKey, files);
    return files;
  }

  async getServerClientDistribution(codeRepositoryCredentials: any) {
    const { owner, name, token } = codeRepositoryCredentials;
    const SERVER = ['server', 'backend'];
    const CLIENT = ['ui', 'client', 'frontend'];

    let stats: any = {};
    const files = await this.getAllChangedFilesByUser(owner, name, token);

    files.forEach((file: GitHubPullRequestFiles) => {
      const user = file.user ?? 'Unknown';

      if (stats[user]) {
        if (SERVER.some((sub) => file.filename.includes(sub))) {
          stats[user].server += file.changes;
        } else if (CLIENT.some((sub) => file.filename.includes(sub))) {
          stats[user].client += file.changes;
        }
      } else {
        stats = {
          ...stats,
          [user]: { server: 0, client: 0 },
        };
      }
    });

    const users = await this.GithubRepository.getRepositoryContributors(
      owner,
      name,
      token
    );
    const statsWithEmployeesUsername: any = {};

    await Promise.all(
      users.map(async (user) => {
        const employee =
          await this.employeeService.findEmployeeByGithubUsername(user.login);
        const displayName = employee?.displayName ?? user.login;
        statsWithEmployeesUsername[displayName] = stats[user.login];
      })
    );

    return statsWithEmployeesUsername;
  }

  async getProjectPullRequests(
    owner: string,
    name: string,
    token: string,
    startDate: string | null = null,
    endDate: string | null = null
  ): Promise<GitHubPullRequest[]> {
    const cacheKey = `project-pulls-${owner}-${name}`;

    const pullRequests = await this.GithubRepository.getPullRequests(
      owner,
      name,
      token,
      startDate,
      endDate,
      'all'
    );

    const pullRequestsExtended = (
      await Promise.all(
        pullRequests.map((pullRequest) =>
          this.GithubRepository.getPullRequestByNumber(
            owner,
            name,
            token,
            pullRequest.number
          )
        )
      )
    ).flat();

    await this.cacheManager.set(cacheKey, pullRequestsExtended);
    return pullRequestsExtended;
  }

  findSprintName(
    sprints: JiraSprintDto[],
    pullRequest: GitHubPullRequest
  ): string {
    const filtered = sprints.filter(
      (sprint) =>
        sprint.startDate &&
        sprint.endDate &&
        new Date(sprint.startDate) <= new Date(pullRequest.created_at) &&
        new Date(sprint.endDate) >= new Date(pullRequest.created_at)
    );

    return filtered.length ? filtered[0].name : 'Backlog';
  }

  async getProjectStatsByUser(
    codeReposityCredentials: any,
    dataType: GithubDataType,
    projectId: string
  ): Promise<any[]> {
    const { owner, name, token } =
      codeReposityCredentials.codeRepositoryCredentials;

    const sprints = await this.jiraService.getJiraSprints(
      codeReposityCredentials.missionManagementCredentials,
      projectId
    );
    const blankStats = sprints.reduce((acc, curr) => {
      acc[curr.name] =
        GithubDtoTransformationMapper[dataType].sprintInitaliztionValue;
      return acc;
    }, {} as Record<string, any>);

    const stats: any = {};

    const pullRequests = await this.getProjectPullRequests(owner, name, token);
    pullRequests.forEach((pullRequest) => {
      const user = pullRequest.user?.login ?? 'Unknown';
      const sprintName = this.findSprintName(sprints, pullRequest);

      if (!stats[user]) stats[user] = structuredClone(blankStats);

      if (sprintName != 'Backlog')
        stats[user][sprintName] = GithubDtoTransformationMapper[
          dataType
        ].dataTransformation(
          structuredClone(stats[user][sprintName]),
          pullRequest
        );
    });

    const users = await this.GithubRepository.getRepositoryContributors(
      owner,
      name,
      token
    );
    const statsWithEmployeesUsername: any = {};

    await Promise.all(
      users.map(async (user) => {
        const employee =
          await this.employeeService.findEmployeeByGithubUsername(user.login);
        const displayName = employee?.displayName ?? user.login;
        statsWithEmployeesUsername[displayName] = stats[user.login];
      })
    );

    return statsWithEmployeesUsername;
  }

  async getProjectStatsBySprint(
    codeReposityCredentials: any,
    dataType: GithubDataType | GithubAvgDataType,
    projectId: string
  ): Promise<any[]> {
    const { owner, name, token } =
      codeReposityCredentials.codeRepositoryCredentials;

    const stats: any = {};

    const sprints = await this.jiraService.getJiraSprints(
      codeReposityCredentials.missionManagementCredentials,
      projectId
    );

    sprints.forEach(
      (sprint) =>
        (stats[sprint.name] =
          GithubDtoTransformationMapper[dataType].sprintInitaliztionValue)
    );

    const pullRequests = await this.getProjectPullRequests(owner, name, token);
    pullRequests.forEach((pullRequest) => {
      const sprintName = this.findSprintName(sprints, pullRequest);

      if (sprintName != 'Backlog')
        stats[sprintName] = GithubDtoTransformationMapper[
          dataType
        ].dataTransformation(structuredClone(stats[sprintName]), pullRequest);
    });

    return stats;
  }

  async getBlindsSpotsInCode(codeRepositoryCredentials: any) {
    const { owner, name, token } = codeRepositoryCredentials;

    const allPRChanges = await this.getAllChangedFilesByUser(
      owner,
      name,
      token
    );

    const sumPointsFromAllPrs = sumPRChangesPoints(allPRChanges);

    return getTopBlindSpotsInCode(sumPointsFromAllPrs, 10);
  }

  async getAvgStatsBySprint(
    codeReposityCredentials: any,
    avgDataType: GithubAvgDataType,
    projectId: string
  ): Promise<AvgStats> {
    const stats = Object.values(
      await this.getProjectStatsBySprint(
        codeReposityCredentials,
        avgDataType,
        projectId
      )
    );

    return {
      avg: stats.reduce((sum, val) => sum + val, 0) / stats.length,
      max: Math.max(...stats),
    };
  }
}
