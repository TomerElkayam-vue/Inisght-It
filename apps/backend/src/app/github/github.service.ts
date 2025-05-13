import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { GithubRepository } from "./github.repository";
import { ProjectsSerivce } from "../projects/project.service";
import {
  GitHubComment,
  UserSpecificStats,
  RepositoryContributor,
  SprintCommentsPerUser,
} from "@packages/github";
import { JiraService } from "../jira/jira.service";
import { EmployeeService } from "../employee/employee.service";

@Injectable()
export class GithubService {
  constructor(
    private readonly githubRepository: GithubRepository,
    private projectsService: ProjectsSerivce,
    private readonly jiraService: JiraService,
    private readonly employeeService: EmployeeService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getPullRequestComments(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<GitHubComment[]> {
    return this.githubRepository.getPullRequestComments(owner, repo, prNumber);
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
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          userStats,
        };
      })
    );

    const employees = await this.employeeService.getEmployees();
    console.log(employees);

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
              login: employee?.displayName || "",
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
      await this.githubRepository.getCommentsRecivedForUser(
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
    return this.githubRepository.getRepositoryContributors(owner, repo);
  }

  async getUserGithubToken(code: string, projectId: string) {
    const token = await this.githubRepository.getUserGithubToken(code);
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
    return this.githubRepository.getOpenPullRequestsBetweenDates(
      owner,
      repo,
      startDate,
      endDate,
      username
    );
  }
}
