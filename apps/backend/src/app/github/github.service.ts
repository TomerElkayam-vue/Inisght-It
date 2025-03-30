import { Injectable } from '@nestjs/common';
import type { Octokit } from '@octokit/rest';

export interface ReviewStats {
  totalReviews: number;
  approved: number;
  changesRequested: number;
  commented: number;
  dismissed: number;
  totalReviewTimeMinutes: number;  // Total time spent reviewing in minutes
}

export interface CommentStats {
  totalComments: number;
  issueComments: number;
  reviewComments: number;
}

export interface UserCommentStats extends CommentStats {
  username: string;
  avatarUrl: string;
  reviews: ReviewStats;
}

export interface UserMetadata {
  username: string;
  avatarUrl: string;
  email: string | null;  // Added email field
  contributionStats: {
    pullRequests: {
      total: number;
      open: number;
      closed: number;
    };
    reviews: ReviewStats;
    comments: CommentStats;
    totalTimeSpentMinutes: number;
  };
}

@Injectable()
export class GitHubService {
  private octokit!: Octokit;

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

  private async getPRReviews(owner: string, repo: string, pullNumber: number): Promise<ReviewStats> {
    try {
      const [{ data: reviews }, { data: pr }] = await Promise.all([
        this.octokit.pulls.listReviews({
          owner,
          repo,
          pull_number: pullNumber,
        }),
        this.octokit.pulls.get({
          owner,
          repo,
          pull_number: pullNumber,
        })
      ]);

      // Calculate total review time
      let totalReviewTimeMinutes = 0;
      for (const review of reviews) {
        if (review.submitted_at) {
          const submittedAt = new Date(review.submitted_at);
          const requestedAt = new Date(pr.created_at);
          const reviewTimeMinutes = (submittedAt.getTime() - requestedAt.getTime()) / (1000 * 60);
          totalReviewTimeMinutes += reviewTimeMinutes;
        }
      }

      return {
        totalReviews: reviews.length,
        approved: reviews.filter(r => r.state === 'APPROVED').length,
        changesRequested: reviews.filter(r => r.state === 'CHANGES_REQUESTED').length,
        commented: reviews.filter(r => r.state === 'COMMENTED').length,
        dismissed: reviews.filter(r => r.state === 'DISMISSED').length,
        totalReviewTimeMinutes,
      };
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to fetch PR reviews: ${err.message}`);
    }
  }

  private async getPRReviewsByUsers(owner: string, repo: string, pullNumber: number): Promise<Map<string, ReviewStats>> {
    try {
      const [{ data: reviews }, { data: pr }] = await Promise.all([
        this.octokit.pulls.listReviews({
          owner,
          repo,
          pull_number: pullNumber,
        }),
        this.octokit.pulls.get({
          owner,
          repo,
          pull_number: pullNumber,
        })
      ]);

      const reviewsByUser = new Map<string, ReviewStats>();

      reviews.forEach(review => {
        const username = review.user?.login || 'unknown';
        if (!reviewsByUser.has(username)) {
          reviewsByUser.set(username, {
            totalReviews: 0,
            approved: 0,
            changesRequested: 0,
            commented: 0,
            dismissed: 0,
            totalReviewTimeMinutes: 0,
          });
        }

        const stats = reviewsByUser.get(username)!;
        stats.totalReviews++;

        // Calculate review time
        if (review.submitted_at) {
          const submittedAt = new Date(review.submitted_at);
          const requestedAt = new Date(pr.created_at);
          const reviewTimeMinutes = (submittedAt.getTime() - requestedAt.getTime()) / (1000 * 60);
          stats.totalReviewTimeMinutes += reviewTimeMinutes;
        }

        switch (review.state) {
          case 'APPROVED':
            stats.approved++;
            break;
          case 'CHANGES_REQUESTED':
            stats.changesRequested++;
            break;
          case 'COMMENTED':
            stats.commented++;
            break;
          case 'DISMISSED':
            stats.dismissed++;
            break;
        }
      });

      return reviewsByUser;
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to fetch PR reviews by users: ${err.message}`);
    }
  }

  private async getPRCommentsByUsers(owner: string, repo: string, pullNumber: number): Promise<UserCommentStats[]> {
    try {
      const [issueComments, reviewComments, reviewsByUser] = await Promise.all([
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
        this.getPRReviewsByUsers(owner, repo, pullNumber),
      ]);

      const userStatsMap = new Map<string, UserCommentStats>();

      // Initialize with review stats
      reviewsByUser.forEach((reviews, username) => {
        userStatsMap.set(username, {
          username,
          avatarUrl: '',
          totalComments: 0,
          issueComments: 0,
          reviewComments: 0,
          reviews,
        });
      });

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
            reviews: {
              totalReviews: 0,
              approved: 0,
              changesRequested: 0,
              commented: 0,
              dismissed: 0,
              totalReviewTimeMinutes: 0,
            },
          });
        }
        const stats = userStatsMap.get(username)!;
        stats.avatarUrl = comment.user?.avatar_url || stats.avatarUrl;
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
            reviews: {
              totalReviews: 0,
              approved: 0,
              changesRequested: 0,
              commented: 0,
              dismissed: 0,
              totalReviewTimeMinutes: 0,
            },
          });
        }
        const stats = userStatsMap.get(username)!;
        stats.avatarUrl = comment.user?.avatar_url || stats.avatarUrl;
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

      const userPRs = pullRequests.filter(pr => pr.user?.login === username);

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
      const err = error as Error;
      throw new Error(`Failed to fetch pull requests: ${err.message}`);
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
        reviews: ReviewStats;
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
            reviews: {
              totalReviews: 0,
              approved: 0,
              changesRequested: 0,
              commented: 0,
              dismissed: 0,
              totalReviewTimeMinutes: 0,
            },
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

        // Get comments and reviews for each PR
        const [issueComments, reviewComments, reviews] = await Promise.all([
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
          this.octokit.pulls.listReviews({
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
              reviews: {
                totalReviews: 0,
                approved: 0,
                changesRequested: 0,
                commented: 0,
                dismissed: 0,
                totalReviewTimeMinutes: 0,
              },
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
              reviews: {
                totalReviews: 0,
                approved: 0,
                changesRequested: 0,
                commented: 0,
                dismissed: 0,
                totalReviewTimeMinutes: 0,
              },
              avatarUrl: comment.user?.avatar_url || '',
            });
          }
          const userStats = contributorsMap.get(commentUser)!;
          userStats.reviewComments++;
          userStats.totalComments++;
        });

        // Process reviews
        reviews.data.forEach(review => {
          const reviewUser = review.user?.login || 'unknown';
          if (!contributorsMap.has(reviewUser)) {
            contributorsMap.set(reviewUser, {
              totalPRs: 0,
              openPRs: 0,
              closedPRs: 0,
              totalComments: 0,
              issueComments: 0,
              reviewComments: 0,
              reviews: {
                totalReviews: 0,
                approved: 0,
                changesRequested: 0,
                commented: 0,
                dismissed: 0,
                totalReviewTimeMinutes: 0,
              },
              avatarUrl: review.user?.avatar_url || '',
            });
          }
          const userStats = contributorsMap.get(reviewUser)!;
          userStats.reviews.totalReviews++;

          // Calculate review time
          if (review.submitted_at) {
            const submittedAt = new Date(review.submitted_at);
            const requestedAt = new Date(pr.created_at);
            const reviewTimeMinutes = (submittedAt.getTime() - requestedAt.getTime()) / (1000 * 60);
            userStats.reviews.totalReviewTimeMinutes += reviewTimeMinutes;
          }

          switch (review.state) {
            case 'APPROVED':
              userStats.reviews.approved++;
              break;
            case 'CHANGES_REQUESTED':
              userStats.reviews.changesRequested++;
              break;
            case 'COMMENTED':
              userStats.reviews.commented++;
              break;
            case 'DISMISSED':
              userStats.reviews.dismissed++;
              break;
          }
        });
      }

      // Calculate total stats
      const totalStats = {
        totalComments: 0,
        issueComments: 0,
        reviewComments: 0,
        reviews: {
          totalReviews: 0,
          approved: 0,
          changesRequested: 0,
          commented: 0,
          dismissed: 0,
          totalReviewTimeMinutes: 0,
        },
      };

      contributorsMap.forEach(stats => {
        totalStats.totalComments += stats.totalComments;
        totalStats.issueComments += stats.issueComments;
        totalStats.reviewComments += stats.reviewComments;
        totalStats.reviews.totalReviews += stats.reviews.totalReviews;
        totalStats.reviews.approved += stats.reviews.approved;
        totalStats.reviews.changesRequested += stats.reviews.changesRequested;
        totalStats.reviews.commented += stats.reviews.commented;
        totalStats.reviews.dismissed += stats.reviews.dismissed;
        totalStats.reviews.totalReviewTimeMinutes += stats.reviews.totalReviewTimeMinutes;
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
            reviews: stats.reviews,
          })),
        },
      };
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to fetch repository stats: ${err.message}`);
    }
  }

  async getReviewStatsByUser(owner: string, repo: string, username: string) {
    try {
      const { data: pullRequests } = await this.octokit.pulls.list({
        owner,
        repo,
        state: 'all',
      });

      let userStats: ReviewStats = {
        totalReviews: 0,
        approved: 0,
        changesRequested: 0,
        commented: 0,
        dismissed: 0,
        totalReviewTimeMinutes: 0,
      };

      // Process each PR for reviews by the user
      for (const pr of pullRequests) {
        const [{ data: reviews }] = await Promise.all([
          this.octokit.pulls.listReviews({
            owner,
            repo,
            pull_number: pr.number,
          }),
        ]);

        const userReviews = reviews.filter(review => review.user?.login === username);
        
        userStats.totalReviews += userReviews.length;
        userStats.approved += userReviews.filter(r => r.state === 'APPROVED').length;
        userStats.changesRequested += userReviews.filter(r => r.state === 'CHANGES_REQUESTED').length;
        userStats.commented += userReviews.filter(r => r.state === 'COMMENTED').length;
        userStats.dismissed += userReviews.filter(r => r.state === 'DISMISSED').length;

        // Calculate review time for each review
        for (const review of userReviews) {
          if (review.submitted_at) {
            const submittedAt = new Date(review.submitted_at);
            const requestedAt = new Date(pr.created_at);
            const reviewTimeMinutes = (submittedAt.getTime() - requestedAt.getTime()) / (1000 * 60);
            userStats.totalReviewTimeMinutes += reviewTimeMinutes;
          }
        }
      }

      return {
        username,
        reviewStats: userStats,
        averageReviewTimeMinutes: userStats.totalReviews > 0 
          ? userStats.totalReviewTimeMinutes / userStats.totalReviews 
          : 0,
      };
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to fetch review stats for user: ${err.message}`);
    }
  }

  async getAllReviewStats(owner: string, repo: string) {
    try {
      const { data: pullRequests } = await this.octokit.pulls.list({
        owner,
        repo,
        state: 'all',
      });

      const userStatsMap = new Map<string, ReviewStats>();
      let totalStats: ReviewStats = {
        totalReviews: 0,
        approved: 0,
        changesRequested: 0,
        commented: 0,
        dismissed: 0,
        totalReviewTimeMinutes: 0,
      };

      // Process each PR for reviews
      for (const pr of pullRequests) {
        const [{ data: reviews }] = await Promise.all([
          this.octokit.pulls.listReviews({
            owner,
            repo,
            pull_number: pr.number,
          }),
        ]);

        // Process reviews for each user
        for (const review of reviews) {
          const username = review.user?.login || 'unknown';
          
          if (!userStatsMap.has(username)) {
            userStatsMap.set(username, {
              totalReviews: 0,
              approved: 0,
              changesRequested: 0,
              commented: 0,
              dismissed: 0,
              totalReviewTimeMinutes: 0,
            });
          }

          const userStats = userStatsMap.get(username)!;
          userStats.totalReviews++;
          totalStats.totalReviews++;

          // Update review state counts
          switch (review.state) {
            case 'APPROVED':
              userStats.approved++;
              totalStats.approved++;
              break;
            case 'CHANGES_REQUESTED':
              userStats.changesRequested++;
              totalStats.changesRequested++;
              break;
            case 'COMMENTED':
              userStats.commented++;
              totalStats.commented++;
              break;
            case 'DISMISSED':
              userStats.dismissed++;
              totalStats.dismissed++;
              break;
          }

          // Calculate review time
          if (review.submitted_at) {
            const submittedAt = new Date(review.submitted_at);
            const requestedAt = new Date(pr.created_at);
            const reviewTimeMinutes = (submittedAt.getTime() - requestedAt.getTime()) / (1000 * 60);
            userStats.totalReviewTimeMinutes += reviewTimeMinutes;
            totalStats.totalReviewTimeMinutes += reviewTimeMinutes;
          }
        }
      }

      // Convert map to array and calculate averages
      const userStats = Array.from(userStatsMap.entries()).map(([username, stats]) => ({
        username,
        reviewStats: stats,
        averageReviewTimeMinutes: stats.totalReviews > 0 
          ? stats.totalReviewTimeMinutes / stats.totalReviews 
          : 0,
      }));

      return {
        totalStats: {
          ...totalStats,
          averageReviewTimeMinutes: totalStats.totalReviews > 0 
            ? totalStats.totalReviewTimeMinutes / totalStats.totalReviews 
            : 0,
        },
        userStats,
      };
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to fetch all review stats: ${err.message}`);
    }
  }

  async getUserMetadata(owner: string, repo: string, username: string): Promise<UserMetadata> {
    try {
      const [prs, reviews, allPRs, userData] = await Promise.all([
        this.getPullRequestsByUser(owner, repo, username),
        this.getReviewStatsByUser(owner, repo, username),
        this.octokit.pulls.list({ owner, repo, state: 'all' }),
        this.octokit.users.getByUsername({ username })
      ]);

      let commentStats = {
        totalComments: 0,
        issueComments: 0,
        reviewComments: 0
      };

      // Get user's avatar URL and email from GitHub API
      let avatarUrl = userData.data.avatar_url || '';
      let email = userData.data.email;

      // Process each PR for comments
      for (const pr of allPRs.data) {
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
          })
        ]);

        // Count comments
        const userIssueComments = issueComments.data.filter(comment => comment.user?.login === username);
        const userReviewComments = reviewComments.data.filter(comment => comment.user?.login === username);

        commentStats.issueComments += userIssueComments.length;
        commentStats.reviewComments += userReviewComments.length;
      }

      commentStats.totalComments = commentStats.issueComments + commentStats.reviewComments;

      return {
        username,
        avatarUrl,
        email,
        contributionStats: {
          pullRequests: {
            total: prs.totalPRs,
            open: prs.pullRequests.filter(pr => pr.state === 'open').length,
            closed: prs.pullRequests.filter(pr => pr.state === 'closed').length,
          },
          reviews: reviews.reviewStats,
          comments: commentStats,
          totalTimeSpentMinutes: reviews.reviewStats.totalReviewTimeMinutes
        }
      };
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to fetch user metadata: ${err.message}`);
    }
  }

  async getRepositoryUserMetadata(owner: string, repo: string) {
    try {
      const [repoData, allPRs] = await Promise.all([
        this.octokit.repos.get({ owner, repo }),
        this.octokit.pulls.list({ owner, repo, state: 'all' })
      ]);

      // Collect all unique usernames from PRs, reviews, and comments
      const userSet = new Set<string>();

      // Add PR authors
      allPRs.data.forEach(pr => {
        if (pr.user?.login) {
          userSet.add(pr.user.login);
        }
      });

      // Process each PR for reviews and comments
      for (const pr of allPRs.data) {
        const [reviews, issueComments, reviewComments] = await Promise.all([
          this.octokit.pulls.listReviews({
            owner,
            repo,
            pull_number: pr.number,
          }),
          this.octokit.issues.listComments({
            owner,
            repo,
            issue_number: pr.number,
          }),
          this.octokit.pulls.listReviewComments({
            owner,
            repo,
            pull_number: pr.number,
          })
        ]);

        // Add reviewers
        reviews.data.forEach(review => {
          if (review.user?.login) {
            userSet.add(review.user.login);
          }
        });

        // Add commenters
        issueComments.data.forEach(comment => {
          if (comment.user?.login) {
            userSet.add(comment.user.login);
          }
        });

        reviewComments.data.forEach(comment => {
          if (comment.user?.login) {
            userSet.add(comment.user.login);
          }
        });
      }

      // Get detailed metadata for each user
      const userMetadata = await Promise.all(
        Array.from(userSet).map(async username => {
          const userData = await this.octokit.users.getByUsername({ username });
          const metadata = await this.getUserMetadata(owner, repo, username);
          return {
            ...metadata,
            email: userData.data.email
          };
        })
      );

      // Sort users by total contributions
      const sortedMetadata = userMetadata.sort((a, b) => {
        const totalA = a.contributionStats.pullRequests.total + 
                      a.contributionStats.reviews.totalReviews + 
                      a.contributionStats.comments.totalComments;
        const totalB = b.contributionStats.pullRequests.total + 
                      b.contributionStats.reviews.totalReviews + 
                      b.contributionStats.comments.totalComments;
        return totalB - totalA;
      });

      return {
        repository: {
          name: repoData.data.name,
          description: repoData.data.description,
          stars: repoData.data.stargazers_count,
          forks: repoData.data.forks_count,
        },
        totalUsers: sortedMetadata.length,
        users: sortedMetadata
      };
    } catch (error) {
      const err = error as Error;
      throw new Error(`Failed to fetch repository user metadata: ${err.message}`);
    }
  }
} 