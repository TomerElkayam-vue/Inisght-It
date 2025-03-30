import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubService {
  private octokit!: Octokit;
  private owner!: string;
  private repo!: string;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('github.token');
    if (!token) {
      throw new Error('GitHub token not found in environment variables');
    }

    this.octokit = new Octokit({
      auth: token,
    });

    this.owner = this.configService.get<string>('github.owner') || '';
    this.repo = this.configService.get<string>('github.repo') || '';

    if (!this.owner || !this.repo) {
      throw new Error('GitHub owner and repo must be configured');
    }
  }

  async getPullRequests(state: 'open' | 'closed' | 'all' = 'all') {
    try {
      const { data: pullRequests } = await this.octokit.pulls.list({
        owner: this.owner,
        repo: this.repo,
        state,
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
      });

      return pullRequests.map(pr => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.state,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        user: pr.user?.login || 'unknown',
        draft: pr.draft,
        html_url: pr.html_url,
        review_comments_url: pr.review_comments_url,
        comments_url: pr.comments_url,
      }));
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 401) {
        throw new UnauthorizedException('Invalid GitHub token');
      }
      throw error;
    }
  }

  async getPullRequestReviews(prNumber: number) {
    try {
      const { data: reviews } = await this.octokit.pulls.listReviews({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
      });

      return reviews.map(review => ({
        id: review.id,
        user: review.user?.login || 'unknown',
        state: review.state,
        submitted_at: review.submitted_at,
        body: review.body,
        commit_id: review.commit_id,
      }));
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 401) {
        throw new UnauthorizedException('Invalid GitHub token');
      }
      throw error;
    }
  }

  async getPullRequestComments(prNumber: number) {
    try {
      const { data: comments } = await this.octokit.pulls.listReviewComments({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
      });

      return comments.map(comment => ({
        id: comment.id,
        user: comment.user?.login || 'unknown',
        body: comment.body,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        path: comment.path,
        line: comment.line,
      }));
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 401) {
        throw new UnauthorizedException('Invalid GitHub token');
      }
      throw error;
    }
  }
} 