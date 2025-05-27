import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import * as config from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import {
  GitHubPullRequest,
  GitHubComment,
  UserCommentsStats,
  UserSpecificStats,
  UserPullRequestStats,
  RepositoryContributor,
  SprintCommentsPerUser,
} from "@packages/github";
import { githubConfig } from "../../../config/github-config";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class GithubRemoteRepository {
  private readonly baseUrl = "https://api.github.com";
  private readonly headers: Record<string, string>;

  constructor(
    @Inject(githubConfig.KEY)
    private githubConfigValues: config.ConfigType<typeof githubConfig>,
    private httpService: HttpService,
    private readonly prisma: PrismaService
  ) {
    const token = this.githubConfigValues.token;
    if (!token) {
      throw new Error("GitHub token not found in environment variables");
    }

    this.headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    };
  }

  private calculateCommentsStats(
    reviewComments: GitHubComment[]
  ): UserCommentsStats[] {
    const userStats = new Map<string, UserCommentsStats>();

    // Count review comments
    reviewComments.forEach((comment) => {
      const login = comment.user?.login || "unknown";
      if (!userStats.has(login)) {
        userStats.set(login, {
          login,
          reviewComments: 0,
        });
      }
      const stats = userStats.get(login)!;
      stats.reviewComments++;
    });

    return Array.from(userStats.values());
  }

  async getCommentsRecivedForUser(
    owner: string,
    repo: string,
    startDate: string | null,
    endDate: string | null,
    username: string
  ): Promise<UserSpecificStats> {
    try {
      // Get all pull requests
      const pullRequests = await this.getPullRequests(
        owner,
        repo,
        startDate,
        endDate,
        "all"
      );

      let totalReviewComments = 0;
      let totalPrTime = 0;
      const userPRs: UserPullRequestStats[] = [];

      // Process each PR
      for (const pr of pullRequests) {
        // Only process PRs created by the user
        if (pr.user?.login === username && pr.commentsStats) {
          // Sum up all comments from other users on this PR
          const otherUsersComments = pr.commentsStats
            .filter((stat) => stat.login !== username)
            .reduce(
              (acc, stat) => ({
                reviewComments: acc.reviewComments + stat.reviewComments,
              }),
              { reviewComments: 0 }
            );

          userPRs.push({
            prNumber: pr.number,
            prTitle: pr.title,
            reviewComments: otherUsersComments.reviewComments,
          });

          totalReviewComments += otherUsersComments.reviewComments;

          if (pr.created_at && pr.closed_at) {
            const createdAt = new Date(pr.created_at);
            const closedAt = new Date(pr.closed_at);
            const timeDiff = closedAt.getTime() - createdAt.getTime();
            totalPrTime += timeDiff;
          }
        }
      }
      return {
        login: username,
        employeeId: "",
        totalReviewComments,
        totalPrTime,
        pullRequests: userPRs,
        averageCommentsPerPR:
          userPRs.length > 0 ? totalReviewComments / userPRs.length : 0,
        averagePrTime: userPRs.length > 0 ? totalPrTime / userPRs.length : 0,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException("Invalid GitHub token");
      }
      throw error;
    }
  }

  async getPullRequests(
    owner: string,
    repo: string,
    startDate: string | null,
    endDate: string | null,
    state: "open" | "closed" | "all" = "all"
  ) {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls`;
      const { data } = await firstValueFrom(
        this.httpService.get<GitHubPullRequest[]>(url, {
          headers: this.headers,
          params: {
            state,
            sort: "updated",
            direction: "desc",
            per_page: 100,
          },
        })
      );

      // Manual filtering
      const filtered = data.filter((pr) => {
        const createdAt = new Date(pr.created_at);
        const afterStart = !startDate || createdAt >= new Date(startDate);
        const beforeEnd = !endDate || createdAt <= new Date(endDate);
        return afterStart && beforeEnd;
      });

      const pullRequestsWithComments = await Promise.all(
        filtered.map(async (pr) => {
          const [reviewComments] = await Promise.all([
            this.getPullRequestComments(owner, repo, pr.number),
          ]);

          return {
            id: pr.id,
            number: pr.number,
            title: pr.title,
            state: pr.state,
            created_at: pr.created_at,
            updated_at: pr.updated_at,
            closed_at: pr.closed_at,
            user: pr.user,
            draft: pr.draft || false,
            html_url: pr.html_url,
            review_comments_url: pr.review_comments_url,
            comments_url: pr.comments_url,
            commentsStats: this.calculateCommentsStats(reviewComments),
          };
        })
      );

      return pullRequestsWithComments;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException("Invalid GitHub token");
      }
      throw error;
    }
  }

  async getPullRequestComments(owner: string, repo: string, prNumber: number) {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/comments`;
      const { data } = await firstValueFrom(
        this.httpService.get<GitHubComment[]>(url, {
          headers: this.headers,
        })
      );

      return data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException("Invalid GitHub token");
      }
      throw error;
    }
  }

  async getRepositoryContributors(
    owner: string,
    repo: string
  ): Promise<RepositoryContributor[]> {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/contributors`;
      const { data } = await firstValueFrom(
        this.httpService.get<RepositoryContributor[]>(url, {
          headers: this.headers,
        })
      );

      return data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException("Invalid GitHub token");
      }
      throw error;
    }
  }

  async getUserGithubToken(code: string): Promise<string> {
    try {
      const url = `https://github.com/login/oauth/access_token`;
      const { data } = await firstValueFrom(
        this.httpService.post<any>(
          url,
          {
            client_id: this.githubConfigValues.oauthClientId,
            client_secret: this.githubConfigValues.oauthClientToken,
            code,
            redirect_uri: this.githubConfigValues.oauthRedirectURI,
          },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        )
      );

      return data.access_token;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException("Invalid GitHub token");
      }
      throw error;
    }
  }

  async getOpenPullRequestsBetweenDates(
    owner: string,
    repo: string,
    startDate: string,
    endDate: string,
    username: string
  ): Promise<any> {
    try {
      const url = `${this.baseUrl}/search/issues?q=type:pr+author:${username}+repo:${owner}/${repo}+created:${startDate}..${endDate}`;
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.headers,
        })
      );

      return data.items;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException("Invalid GitHub token");
      }
      throw error;
    }
  }

  async storeSprintStats(
    projectId: string,
    sprintStats: SprintCommentsPerUser[]
  ) {
    console.log("=---------");
    for (const sprint of sprintStats) {
      // Create or update sprint
      await this.prisma.sprint.upsert({
        where: {
          id: sprint.sprintId,
        },
        update: {
          name: sprint.sprintName,
          startDate: new Date(sprint.startDate),
          endDate: new Date(sprint.endDate),
          projectId,
        },
        create: {
          id: sprint.sprintId,
          name: sprint.sprintName,
          startDate: new Date(sprint.startDate),
          endDate: new Date(sprint.endDate),
          projectId,
        },
      });

      // Store user stats for each user in the sprint
      for (const userStat of sprint.userStats) {
        const userStatsRecord = await this.prisma.userStats.upsert({
          where: {
            sprintId_employeeId: {
              sprintId: sprint.sprintId,
              employeeId: userStat.employeeId,
            },
          },
          update: {
            totalReviewComments: userStat.totalReviewComments,
            totalPrTime: userStat.totalPrTime,
            averageCommentsPerPR: userStat.averageCommentsPerPR,
            averagePrTime: userStat.averagePrTime,
          },
          create: {
            sprintId: sprint.sprintId,
            employeeId: userStat.employeeId,
            totalReviewComments: userStat.totalReviewComments,
            totalPrTime: userStat.totalPrTime,
            averageCommentsPerPR: userStat.averageCommentsPerPR,
            averagePrTime: userStat.averagePrTime,
          },
        });

        // Store pull requests for each user
        for (const pr of userStat.pullRequests) {
          await this.prisma.pullRequest.upsert({
            where: {
              prNumber_userStatsId: {
                prNumber: pr.prNumber,
                userStatsId: userStatsRecord.id,
              },
            },
            update: {
              prTitle: pr.prTitle,
              reviewComments: pr.reviewComments,
            },
            create: {
              prNumber: pr.prNumber,
              prTitle: pr.prTitle,
              reviewComments: pr.reviewComments,
              userStatsId: userStatsRecord.id,
            },
          });
        }
      }
    }
  }

  async getUsersRepositories(ghoToken: string) {
    try {
      const url = 'https://api.github.com/user/repos';
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.headers,
        })
      );

      return data.map((item: { id: string, name: string; owner: { login: string; }; }) => ({id: item.id, name: item.name, owner: item.owner.login}));
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException("Invalid GitHub token");
      }
      throw error;
    }
  }
}
