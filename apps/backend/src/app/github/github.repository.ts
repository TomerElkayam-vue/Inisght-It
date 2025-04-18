import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as config from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  GitHubPullRequest,
  GitHubComment,
  UserCommentsStats,
  UserSpecificStats,
  UserPullRequestStats,
  RepositoryContributor,
} from './types/github.types';
import { GithubConfig, githubConfig } from '../../config/github-config';

@Injectable()
export class GithubRepository {
  private readonly baseUrl = 'https://api.github.com';
  private readonly headers: Record<string, string>;

  constructor(
    @Inject(githubConfig.KEY)
    private githubConfigValues: config.ConfigType<typeof githubConfig>,
    private httpService: HttpService
  ) {
    const token = this.githubConfigValues.token;
    if (!token) {
      throw new Error('GitHub token not found in environment variables');
    }

    this.headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    };
  }

  private calculateCommentsStats(
    reviewComments: GitHubComment[]
  ): UserCommentsStats[] {
    const userStats = new Map<string, UserCommentsStats>();

    // Count review comments
    reviewComments.forEach((comment) => {
      const login = comment.user?.login || 'unknown';
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

  async getUserStats(
    owner: string,
    repo: string,
    username: string
  ): Promise<UserSpecificStats> {
    try {
      // Get all pull requests
      const pullRequests = await this.getPullRequests(owner, repo, 'all');

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
        totalReviewComments,
        totalPrTime,
        pullRequests: userPRs,
        averageCommentsPerPR:
          userPRs.length > 0 ? totalReviewComments / userPRs.length : 0,
        averagePrTime: userPRs.length > 0 ? totalPrTime / userPRs.length : 0,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid GitHub token');
      }
      throw error;
    }
  }

  async getPullRequests(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'all'
  ) {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls`;
      const { data } = await firstValueFrom(
        this.httpService.get<GitHubPullRequest[]>(url, {
          headers: this.headers,
          params: {
            state,
            sort: 'updated',
            direction: 'desc',
            per_page: 100,
          },
        })
      );

      const pullRequestsWithComments = await Promise.all(
        data.map(async (pr) => {
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
        throw new UnauthorizedException('Invalid GitHub token');
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
        throw new UnauthorizedException('Invalid GitHub token');
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
        throw new UnauthorizedException('Invalid GitHub token');
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
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        )
      );

      return data.access_token;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid GitHub token');
      }
      throw error;
    }
  }
}
