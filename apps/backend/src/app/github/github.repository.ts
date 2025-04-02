import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { 
  GitHubPullRequest, 
  GitHubReview, 
  GitHubComment, 
  UserCommentsStats,
  UserSpecificStats,
  UserPullRequestStats,
  RepositoryUser,
  GitHubUser
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

  private calculateCommentsStats(
    reviewComments: GitHubComment[],
  ): UserCommentsStats[] {
    const userStats = new Map<string, UserCommentsStats>();

    // Count review comments
    reviewComments.forEach(comment => {
      const login = comment.user?.login || 'unknown';
      if (!userStats.has(login)) {
        userStats.set(login, {
          login,
          reviewComments: 0
        });
      }
      const stats = userStats.get(login)!;
      stats.reviewComments++;
    });

    return Array.from(userStats.values());
  }

  async getUserStats(owner: string, repo: string, username: string): Promise<UserSpecificStats> {
    try {
      // Get all pull requests
      const pullRequests = await this.getPullRequests(owner, repo, 'all');
      
      let totalReviewComments = 0;
      const userPRs: UserPullRequestStats[] = [];

      // Process each PR
      for (const pr of pullRequests) {
        // Only process PRs created by the user
        if (pr.user?.login === username && pr.commentsStats) {
          // Sum up all comments from other users on this PR
          const otherUsersComments = pr.commentsStats
            .filter(stat => stat.login !== username)
            .reduce((acc, stat) => ({
              reviewComments: acc.reviewComments + stat.reviewComments,
            }), { reviewComments: 0});

          userPRs.push({
            prNumber: pr.number,
            prTitle: pr.title,
            reviewComments: otherUsersComments.reviewComments
          });

          totalReviewComments += otherUsersComments.reviewComments;
        }
      }

      return {
        login: username,
        totalReviewComments,
        pullRequests: userPRs,
        averageCommentsPerPR: userPRs.length > 0 ? totalReviewComments / userPRs.length : 0
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
          commentsStats: this.calculateCommentsStats(reviewComments)
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

  async getRepositoryUsers(owner: string, repo: string): Promise<RepositoryUser[]> {
    try {
      // Get all pull requests
      const pullRequests = await this.getPullRequests(owner, repo, 'all');
      
      // Get unique usernames from all PRs
      const uniqueUsernames = new Set<string>();
      pullRequests.forEach(pr => {
        if (pr.user?.login) {
          uniqueUsernames.add(pr.user.login);
        }
        if (pr.commentsStats) {
          pr.commentsStats.forEach(stat => {
            uniqueUsernames.add(stat.login);
          });
        }
      });

      // Get user details from GitHub API
      const userDetails = await Promise.all(
        Array.from(uniqueUsernames).map(async (username) => {
          const url = `${this.baseUrl}/users/${username}`;
          const { data } = await firstValueFrom(
            this.httpService.get<GitHubUser>(url, {
              headers: this.headers,
            })
          );

          // Count user's contributions
          const userPRs = pullRequests.filter(pr => pr.user?.login === username);
          const userComments = pullRequests.reduce((sum, pr) => {
            const userStat = pr.commentsStats?.find(stat => stat.login === username);
            return sum + (userStat?.reviewComments || 0);
          }, 0);

          const userReviews = await Promise.all(
            userPRs.map(pr => this.getPullRequestReviews(owner, repo, pr.number))
          );
          const totalReviews = userReviews.reduce((sum, reviews) => 
            sum + reviews.filter(review => review.user?.login === username).length, 0);

          return {
            login: username,
            id: data.id || 0,
            type: data.type || 'User',
            site_admin: data.site_admin || false,
            contributions: userPRs.length + userComments + totalReviews,
            pullRequests: userPRs.length,
            comments: userComments,
            reviews: totalReviews
          };
        })
      );

      return userDetails;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid GitHub token');
      }
      throw error;
    }
  }
} 