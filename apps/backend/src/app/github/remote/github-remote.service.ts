import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { GithubRemoteRepository } from "./github-remote.reposetory";
import { GithubRepository } from "../db/github.reposetory";
import { ProjectsSerivce } from "../../projects/project.service";
import {
  GitHubComment,
  UserSpecificStats,
  RepositoryContributor,
  SprintCommentsPerUser,
} from "@packages/github";
import { JiraService } from "../../jira/jira.service";
import { EmployeeService } from "../../employee/employee.service";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class GithubRemoteService {
  constructor(
    private readonly GithubRemoteRepository: GithubRemoteRepository,
    private readonly GithubRepository: GithubRepository,
    private projectsService: ProjectsSerivce,
    private readonly jiraService: JiraService,
    private readonly employeeService: EmployeeService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getPullRequestComments(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<GitHubComment[]> {
    return this.GithubRemoteRepository.getPullRequestComments(
      owner,
      repo,
      prNumber
    );
  }

  async getProjectStats(
    owner: string,
    repo: string
  ): Promise<SprintCommentsPerUser[]> {
    const cacheKey = `project-stats-${owner}-${repo}`;
    const cachedData = await this.cacheManager.get<SprintCommentsPerUser[]>(
      cacheKey
    );

    if (cachedData) {
      return cachedData;
    }

    const sprints = await this.jiraService.getJiraSprints();
    const users = await this.getRepositoryContributors(owner, repo);

    const sprintStats = await Promise.all(
      sprints.map(async (sprint) => {
        const userStats = await Promise.all(
          users.map((user) =>
            this.getUserStatsPerSprint(
              owner,
              repo,
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
              login: employee?.displayName ?? "",
              employeeId:
                employee?.id ?? "381be2c1-012f-44c7-818a-6d78f4ad2067",
            };
          }),
      })
    );

    // Store the sprint stats in the database
    const projectId = "381be2c1-012f-44c7-818a-6d78f4ad2067"; // TODO: REPLACE WITH THE PROJECT ID

    await this.GithubRepository.storeSprintStats(
      projectId,
      sprintStatsWithDispalyName
    );

    await this.cacheManager.set(cacheKey, sprintStatsWithDispalyName, 300000);
    return sprintStatsWithDispalyName;
  }

  async getUserStatsPerSprint(
    owner: string,
    repo: string,
    username: string,
    startDate: string | null,
    endDate: string | null
  ): Promise<UserSpecificStats> {
    const cacheKey = `user-stats-${owner}-${repo}-${username}-${startDate}-${endDate}`;
    const cachedData = await this.cacheManager.get<UserSpecificStats>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const userSpecificStats =
      await this.GithubRemoteRepository.getCommentsRecivedForUser(
        owner,
        repo,
        startDate,
        endDate,
        username
      );

    await this.cacheManager.set(cacheKey, userSpecificStats, 300000);
    return userSpecificStats;
  }

  async getRepositoryContributors(
    owner: string,
    repo: string
  ): Promise<RepositoryContributor[]> {
    return this.GithubRemoteRepository.getRepositoryContributors(owner, repo);
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
    startDate: string,
    endDate: string,
    username: string
  ): Promise<RepositoryContributor[]> {
    return this.GithubRemoteRepository.getOpenPullRequestsBetweenDates(
      owner,
      repo,
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
        startDate: "asc",
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
}
