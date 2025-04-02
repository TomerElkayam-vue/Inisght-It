import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { 
  GitHubPullRequest, 
  GitHubReview, 
  GitHubComment, 
  PullRequestDuration, 
  UserCommentsStats,
  ProjectCommentsStats,
  UserSpecificStats,
  UserPullRequestStats
} from './types/github.types';

@Injectable()
export class GithubRepository {
  private readonly baseUrl = 'https://api.github.com';
  private readonly headers: Record<string, string>;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    const token = this.configService.get<string>('github.token');
    if (!token) {
      throw new Error('GitHub token not found in environment variables');
    }

    this.headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    };
  }

  private calculatePRDuration(createdAt: string, closedAt?: string): PullRequestDuration {
    const startDate = new Date(createdAt);
    const endDate = closedAt ? new Date(closedAt) : new Date();
    const durationMs = endDate.getTime() - startDate.getTime();
    
    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      days,
      hours,
      minutes,
      isOpen: !closedAt
    };
  }

  private async getIssueComments(owner: string, repo: string, prNumber: number): Promise<GitHubComment[]> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/issues/${prNumber}/comments`;
    const { data } = await firstValueFrom(
      this.httpService.get<GitHubComment[]>(url, {
        headers: this.headers,
      })
    );
    return data;
  }

  private calculateCommentsStats(
    reviewComments: GitHubComment[],
    issueComments: GitHubComment[]
  ): UserCommentsStats[] {
    const userStats = new Map<string, UserCommentsStats>();

    // Count review comments
    reviewComments.forEach(comment => {
      const login = comment.user?.login || 'unknown';
      if (!userStats.has(login)) {
        userStats.set(login, {
          login,
          totalComments: 0,
          reviewComments: 0,
          issueComments: 0
        });
      }
      const stats = userStats.get(login)!;
      stats.reviewComments++;
      stats.totalComments++;
    });

    // Count issue comments
    issueComments.forEach(comment => {
      const login = comment.user?.login || 'unknown';
      if (!userStats.has(login)) {
        userStats.set(login, {
          login,
          totalComments: 0,
          reviewComments: 0,
          issueComments: 0
        });
      }
      const stats = userStats.get(login)!;
      stats.issueComments++;
      stats.totalComments++;
    });

    return Array.from(userStats.values());
  }

  async getUserStats(owner: string, repo: string, username: string): Promise<UserSpecificStats> {
    try {
      // Get all pull requests
      const pullRequests = await this.getPullRequests(owner, repo, 'all');
      
      let totalComments = 0;
      let totalReviewComments = 0;
      let totalIssueComments = 0;
      const userPRs: UserPullRequestStats[] = [];

      // Process each PR
      for (const pr of pullRequests) {
        // Only process PRs created by the user
        if (pr.user?.login === username && pr.commentsStats) {
          // Sum up all comments from other users on this PR
          const otherUsersComments = pr.commentsStats
            .filter(stat => stat.login !== username)
            .reduce((acc, stat) => ({
              totalComments: acc.totalComments + stat.totalComments,
              reviewComments: acc.reviewComments + stat.reviewComments,
              issueComments: acc.issueComments + stat.issueComments
            }), { totalComments: 0, reviewComments: 0, issueComments: 0 });

          userPRs.push({
            prNumber: pr.number,
            prTitle: pr.title,
            comments: otherUsersComments.totalComments,
            reviewComments: otherUsersComments.reviewComments,
            issueComments: otherUsersComments.issueComments
          });

          totalComments += otherUsersComments.totalComments;
          totalReviewComments += otherUsersComments.reviewComments;
          totalIssueComments += otherUsersComments.issueComments;
        }
      }

      return {
        login: username,
        totalComments,
        totalReviewComments,
        totalIssueComments,
        pullRequests: userPRs,
        averageCommentsPerPR: userPRs.length > 0 ? totalComments / userPRs.length : 0
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid GitHub token');
      }
      throw error;
    }
  }

  async getProjectCommentsStats(owner: string, repo: string): Promise<ProjectCommentsStats> {
    try {
      // Get all pull requests (both open and closed)
      const pullRequests = await this.getPullRequests(owner, repo, 'all');
      
      // Combine all comments stats from all PRs
      const allUserStats = new Map<string, UserCommentsStats>();
      let totalComments = 0;

      pullRequests.forEach(pr => {
        if (pr.commentsStats) {
          pr.commentsStats.forEach(userStat => {
            const existingStats = allUserStats.get(userStat.login) || {
              login: userStat.login,
              totalComments: 0,
              reviewComments: 0,
              issueComments: 0
            };

            existingStats.totalComments += userStat.totalComments;
            existingStats.reviewComments += userStat.reviewComments;
            existingStats.issueComments += userStat.issueComments;
            totalComments += userStat.totalComments;

            allUserStats.set(userStat.login, existingStats);
          });
        }
      });

      const userStats = Array.from(allUserStats.values());

      // Find most active reviewer
      const mostActiveReviewer = userStats.reduce((prev, current) => {
        return (prev.totalComments > current.totalComments) ? prev : current;
      }, userStats[0] || { login: 'none', totalComments: 0 });

      return {
        totalPullRequests: pullRequests.length,
        totalComments,
        userStats,
        averageCommentsPerPR: pullRequests.length > 0 ? totalComments / pullRequests.length : 0,
        mostActiveReviewer: {
          login: mostActiveReviewer.login,
          totalComments: mostActiveReviewer.totalComments
        }
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid GitHub token');
      }
      throw error;
    }
  }

  async getPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'all') {
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

      const pullRequestsWithComments = await Promise.all(data.map(async (pr) => {
        const [reviewComments, issueComments] = await Promise.all([
          this.getPullRequestComments(owner, repo, pr.number),
          this.getIssueComments(owner, repo, pr.number)
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
          duration: this.calculatePRDuration(pr.created_at, pr.closed_at),
          commentsStats: this.calculateCommentsStats(reviewComments, issueComments)
        };
      }));

      return pullRequestsWithComments;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid GitHub token');
      }
      throw error;
    }
  }

  async getPullRequestReviews(owner: string, repo: string, prNumber: number) {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/reviews`;
      const { data } = await firstValueFrom(
        this.httpService.get<GitHubReview[]>(url, {
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
} 