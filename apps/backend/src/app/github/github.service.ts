import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GithubRemoteRepository } from './github.reposetory';
import { ProjectsSerivce } from '../projects/project.service';
import {
  GitHubComment,
  UserSpecificStats,
  RepositoryContributor,
  SprintCommentsPerUser,
} from '@packages/github';
import { JiraService } from '../jira/jira.service';
import { EmployeeService } from '../employee/employee.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GithubRemoteService {
  constructor(
    private readonly GithubRemoteRepository: GithubRemoteRepository,
    private projectsService: ProjectsSerivce,
    private readonly jiraService: JiraService,
    private readonly employeeService: EmployeeService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getPullRequestComments(
    owner: string,
    repo: string,
    token: string,
    prNumber: number
  ): Promise<GitHubComment[]> {
    return this.GithubRemoteRepository.getPullRequestComments(
      owner,
      repo,
      token,
      prNumber
    );
  }

  async getProjectStats(
    projectManagmentSettings: any,
    projectId: string
  ): Promise<SprintCommentsPerUser[]> {
    const {name, owner, token} = projectManagmentSettings?.codeRepositoryCredentials;

    const cacheKey = `project-stats-${owner}-${name}`;

    const sprints = await this.jiraService.getJiraSprints(
      projectManagmentSettings?.missionManagementCredentials,
      projectId
    );

    const users = await this.getRepositoryContributors(owner, name, token);

    const sprintStats = await Promise.all(
      sprints.map(async (sprint) => {
        const userStats = await Promise.all(
          users.map((user) =>
            this.getUserStatsPerSprint(
              owner,
              name,
              token,
              user.login,
              sprint.startDate,
              sprint.endDate
            )
          )
        );

        return {
          sprintId: sprint.id,
          sprintName: sprint.name,
          startDate: sprint.startDate ?? new Date().toISOString(),
          endDate: sprint.endDate ?? new Date().toISOString(),
          userStats,
        };
      })
    );

    //TODO: when getting project id select only the workers in current project
    const employees = await this.employeeService.getEmployees();

    const sprintStatsWithDispalyName = sprintStats.map(
      ({ userStats, ...rest }) => ({
        ...rest,
        userStats: userStats
          .filter(({ login }) =>
            employees.find(({ githubUsername }) => githubUsername === login)
          )
          .map(({ login, ...rest }) => {
            const employee = employees.find(
              ({ githubUsername }) => githubUsername === login
            );

            return {
              ...rest,
              login: employee?.displayName ?? '',
              employeeId:
                employee?.id ?? '381be2c1-012f-44c7-818a-6d78f4ad2067',
            };
          }),
      })
    );

    await this.cacheManager.set(cacheKey, sprintStatsWithDispalyName, 300000);
    return sprintStatsWithDispalyName;
  }

  async getUserStatsPerSprint(
    owner: string,
    repo: string,
    token: string,
    username: string,
    startDate: string | null,
    endDate: string | null
  ): Promise<UserSpecificStats> {
    const cacheKey = `user-stats-${owner}-${repo}-${username}-${startDate}-${endDate}`;


    const userSpecificStats =
      await this.GithubRemoteRepository.getCommentsRecivedForUser(
        owner,
        repo,
        token,
        startDate,
        endDate,
        username
      );

    await this.cacheManager.set(cacheKey, userSpecificStats, 300000);
    return userSpecificStats;
  }

  async getRepositoryContributors(
    owner: string,
    repo: string,
    token: string
  ): Promise<RepositoryContributor[]> {
    return this.GithubRemoteRepository.getRepositoryContributors(owner, repo, token);
  }

  async getUserGithubToken(code: string, projectId: string) {
    const token = await this.GithubRemoteRepository.getUserGithubToken(code);
    await this.projectsService.updateProject({
      where: { id: projectId },
      data: {
        codeRepositoryCredentials: { token },
      },
    });
    return token;
  }

  async getUserPullRequests(
    owner: string,
    repo: string,
    token: string,
    startDate: string,
    endDate: string,
    username: string
  ): Promise<RepositoryContributor[]> {
    return this.GithubRemoteRepository.getOpenPullRequestsBetweenDates(
      owner,
      repo,
      token,
      startDate,
      endDate,
      username
    );
  }

  async getSprintStatsByProjectId(projectId: string) {
    const sprints = await this.prisma.sprint.findMany({
      where: {
        projectId,
      },
      include: {
        userStats: {
          include: {
            employee: true,
            pullRequests: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return sprints.map((sprint) => ({
      sprintId: sprint.id,
      sprintName: sprint.name,
      startDate: sprint.startDate.toISOString(),
      endDate: sprint.endDate.toISOString(),
      userStats: sprint.userStats.map((userStat) => ({
        login: userStat.employee.displayName,
        employeeId: userStat.employeeId,
        totalReviewComments: userStat.totalReviewComments,
        totalPrTime: userStat.totalPrTime,
        averageCommentsPerPR: userStat.averageCommentsPerPR,
        averagePrTime: userStat.averagePrTime,
        pullRequests: userStat.pullRequests.map((pr) => ({
          prNumber: pr.prNumber,
          prTitle: pr.prTitle,
          reviewComments: pr.reviewComments,
        })),
      })),
    }));
  }

  async getUsersRepositories(token: string) {
    return this.GithubRemoteRepository.getUsersRepositories(token);
  }

  async updateGithubProjectOnProject(
    projectId: string,
    githubProject: { id: string; name: string; owner: string }
  ) {
    const currentCodeRepositoryCredentials = (
      await this.projectsService.getProject({ id: projectId })
    )?.codeRepositoryCredentials as any;

    const settings = {
      ...currentCodeRepositoryCredentials,
      ...githubProject
    };

    await this.projectsService.updateProject({
      where: { id: projectId },
      data: { codeRepositoryCredentials: settings },
    });
  }
}
