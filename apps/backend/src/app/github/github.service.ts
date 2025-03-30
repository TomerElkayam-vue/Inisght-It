import { Injectable } from '@nestjs/common';
import type { Octokit } from '@octokit/rest';

interface CommentStats {
  totalComments: number;
  issueComments: number;
  reviewComments: number;
}

interface UserCommentStats extends CommentStats {
  username: string;
  avatarUrl: string;
}

@Injectable()
export class GitHubService {
  private octokit: Octokit;

  constructor() {
    this.initOctokit();
  }

  private async initOctokit() {
    const { Octokit } = await import('@octokit/rest');
    this.octokit = new Octokit();
  }

  private async getAllPages(owner: string, repo: string, state: 'all' | 'open' | 'closed', page: number, per_page: number) {
    const { data, headers } = await this.octokit.pulls.list({
      owner,
      repo,
      state,
      page,
      per_page,
    });

    // Get total count from GitHub API response headers
    const totalCount = parseInt(headers['link']?.match(/page=(\d+)>; rel="last"/)?.[1] || '1');

    return {
      data,
      totalPages: totalCount,
    };
  }

  private async getPRComments(owner: string, repo: string, pullNumber: number): Promise<CommentStats> {
    try {
      const [issueComments, reviewComments] = await Promise.all([
        this.octokit.issues.listComments({
          owner,
          repo,
          issue_number: pullNumber,
        }),
        this.octokit.pulls.listReviewComments({
          owner,
          repo,
          pull_number: pullNumber,
        }),
      ]);

      return {
        totalComments: issueComments.data.length + reviewComments.data.length,
        issueComments: issueComments.data.length,
        reviewComments: reviewComments.data.length,
      };
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to fetch PR comments: ${err.message}`);
    }
  }

  private async getPRCommentsByUsers(owner: string, repo: string, pullNumber: number): Promise<UserCommentStats[]> {
    try {
      const [issueComments, reviewComments] = await Promise.all([
        this.octokit.issues.listComments({
          owner,
          repo,
          issue_number: pullNumber,
        }),
        this.octokit.pulls.listReviewComments({
          owner,
          repo,
          pull_number: pullNumber,
        }),
      ]);

      const userStatsMap = new Map<string, UserCommentStats>();

      // Process issue comments
      issueComments.data.forEach(comment => {
        const username = comment.user?.login || 'unknown';
        if (!userStatsMap.has(username)) {
          userStatsMap.set(username, {
            username,
            avatarUrl: comment.user?.avatar_url || '',
            totalComments: 0,
            issueComments: 0,
            reviewComments: 0,
          });
        }
        const stats = userStatsMap.get(username)!;
        stats.issueComments++;
        stats.totalComments++;
      });

      // Process review comments
      reviewComments.data.forEach(comment => {
        const username = comment.user?.login || 'unknown';
        if (!userStatsMap.has(username)) {
          userStatsMap.set(username, {
            username,
            avatarUrl: comment.user?.avatar_url || '',
            totalComments: 0,
            issueComments: 0,
            reviewComments: 0,
          });
        }
        const stats = userStatsMap.get(username)!;
        stats.reviewComments++;
        stats.totalComments++;
      });

      return Array.from(userStatsMap.values());
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to fetch PR comments by users: ${err.message}`);
    }
  }

  async getAllPullRequests(
    owner: string, 
    repo: string, 
    state: 'all' | 'open' | 'closed' = 'all',
    page: number = 1,
    per_page: number = 30
  ) {
    try {
      const { data: pullRequests, totalPages } = await this.getAllPages(owner, repo, state, page, per_page);

      const prsWithComments = await Promise.all(
        pullRequests.map(async pr => {
          const [commentStats, commentsByUser] = await Promise.all([
            this.getPRComments(owner, repo, pr.number),
            this.getPRCommentsByUsers(owner, repo, pr.number),
          ]);

          return {
            id: pr.id,
            number: pr.number,
            title: pr.title,
            state: pr.state,
            user: {
              login: pr.user?.login || 'unknown',
              avatarUrl: pr.user?.avatar_url || '',
            },
            createdAt: pr.created_at,
            updatedAt: pr.updated_at,
            closedAt: pr.closed_at,
            mergedAt: pr.merged_at,
            labels: pr.labels.map(label => ({
              name: label.name,
              color: label.color,
            })),
            comments: commentStats,
            commentsByUser: commentsByUser,
            url: pr.html_url,
            draft: pr.draft,
            base: {
              ref: pr.base.ref,
              label: pr.base.label,
            },
            head: {
              ref: pr.head.ref,
              label: pr.head.label,
            },
          };
        })
      );

      return {
        total: prsWithComments.length,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        pullRequests: prsWithComments,
      };
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to fetch pull requests: ${err.message}`);
    }
  }

  async getPullRequestsByUser(owner: string, repo: string, username: string) {
    try {
      const { data: pullRequests } = await this.octokit.pulls.list({
        owner,
        repo,
        state: 'all',
      });

      const userPRs = pullRequests.filter(pr => pr.user.login === username);

      return {
        totalPRs: userPRs.length,
        pullRequests: userPRs.map(pr => ({
          id: pr.id,
          number: pr.number,
          title: pr.title,
          state: pr.state,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          closedAt: pr.closed_at,
          mergedAt: pr.merged_at,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to fetch pull requests: ${error.message}`);
    }
  }

  async getRepositoryStats(owner: string, repo: string) {
    try {
      const [repoData, pullRequests] = await Promise.all([
        this.octokit.repos.get({ owner, repo }),
        this.octokit.pulls.list({ owner, repo, state: 'all' }),
      ]);

      const contributorsMap = new Map<string, {
        totalPRs: number;
        openPRs: number;
        closedPRs: number;
        totalComments: number;
        issueComments: number;
        reviewComments: number;
        avatarUrl: string;
      }>();

      // Process PRs first
      for (const pr of pullRequests.data) {
        const username = pr.user?.login || 'unknown';
        if (!contributorsMap.has(username)) {
          contributorsMap.set(username, {
            totalPRs: 0,
            openPRs: 0,
            closedPRs: 0,
            totalComments: 0,
            issueComments: 0,
            reviewComments: 0,
            avatarUrl: pr.user?.avatar_url || '',
          });
        }
        
        const stats = contributorsMap.get(username)!;
        stats.totalPRs++;
        if (pr.state === 'open') {
          stats.openPRs++;
        } else {
          stats.closedPRs++;
        }

        // Get comments for each PR
        const [issueComments, reviewComments] = await Promise.all([
          this.octokit.issues.listComments({
            owner,
            repo,
            issue_number: pr.number,
          }),
          this.octokit.pulls.listReviewComments({
            owner,
            repo,
            pull_number: pr.number,
          }),
        ]);

        // Process comments and update contributor stats
        issueComments.data.forEach(comment => {
          const commentUser = comment.user?.login || 'unknown';
          if (!contributorsMap.has(commentUser)) {
            contributorsMap.set(commentUser, {
              totalPRs: 0,
              openPRs: 0,
              closedPRs: 0,
              totalComments: 0,
              issueComments: 0,
              reviewComments: 0,
              avatarUrl: comment.user?.avatar_url || '',
            });
          }
          const userStats = contributorsMap.get(commentUser)!;
          userStats.issueComments++;
          userStats.totalComments++;
        });

        reviewComments.data.forEach(comment => {
          const commentUser = comment.user?.login || 'unknown';
          if (!contributorsMap.has(commentUser)) {
            contributorsMap.set(commentUser, {
              totalPRs: 0,
              openPRs: 0,
              closedPRs: 0,
              totalComments: 0,
              issueComments: 0,
              reviewComments: 0,
              avatarUrl: comment.user?.avatar_url || '',
            });
          }
          const userStats = contributorsMap.get(commentUser)!;
          userStats.reviewComments++;
          userStats.totalComments++;
        });
      }

      // Calculate total comment stats
      const totalStats = {
        totalComments: 0,
        issueComments: 0,
        reviewComments: 0,
      };

      contributorsMap.forEach(stats => {
        totalStats.totalComments += stats.totalComments;
        totalStats.issueComments += stats.issueComments;
        totalStats.reviewComments += stats.reviewComments;
      });

      return {
        repoInfo: {
          name: repoData.data.name,
          description: repoData.data.description,
          stars: repoData.data.stargazers_count,
          forks: repoData.data.forks_count,
        },
        pullRequestStats: {
          total: pullRequests.data.length,
          commentStats: totalStats,
          contributorStats: Array.from(contributorsMap.entries()).map(([username, stats]) => ({
            username,
            avatarUrl: stats.avatarUrl,
            totalPRs: stats.totalPRs,
            openPRs: stats.openPRs,
            closedPRs: stats.closedPRs,
            totalComments: stats.totalComments,
            issueComments: stats.issueComments,
            reviewComments: stats.reviewComments,
          })),
        },
      };
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to fetch repository stats: ${err.message}`);
    }
  }
} 