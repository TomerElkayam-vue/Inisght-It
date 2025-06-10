import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import * as config from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import {
  GitHubPullRequest,
  RepositoryContributor,
} from "@packages/github";
import { githubConfig } from "../../config/github-config";

@Injectable()
export class GithubRepository {
  private readonly baseUrl = "https://api.github.com";

  constructor(
    @Inject(githubConfig.KEY)
    private githubConfigValues: config.ConfigType<typeof githubConfig>,
    private httpService: HttpService,
  ) {}

  async getPullRequests(
    owner: string,
    repo: string,
    token: string,
    startDate: string | null = null,
    endDate: string | null = null,
    state: "open" | "closed" | "all" = "all"
  ) {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls`;
      const { data } = await firstValueFrom(
        this.httpService.get<GitHubPullRequest[]>(url, {
          headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          params: {
            state,
            sort: "updated",
            direction: "desc"
          },
        })
      );

      if (startDate && endDate) 
      return data.filter((pr) => {
        const createdAt = new Date(pr.created_at);
        const afterStart = !startDate || createdAt >= new Date(startDate);
        const beforeEnd = !endDate || createdAt <= new Date(endDate);
        return afterStart && beforeEnd;
      });

      return data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException("Invalid GitHub token");
      }
      throw error;
    }
  }

  async getPullRequestByNumber(
    owner: string,
    repo: string,
    token: string,
    number: number
  ) {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls/${number}`;
      const { data } = await firstValueFrom(
        this.httpService.get<GitHubPullRequest>(url, {
          headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
        })
      );

      const {
        id, 
        number : prNumber,
        created_at,
        updated_at, 
        closed_at, 
        user, 
        review_comments, 
        commits, 
        additions, 
        deletions, 
        changed_files
      } = data;

      return {
        id, 
        number: prNumber,
        created_at,
        updated_at, 
        closed_at, 
        user, 
        review_comments, 
        commits, 
        additions, 
        deletions, 
        changed_files
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException("Invalid GitHub token");
      }
      throw error;
    }
  }

  async getRepositoryContributors(
    owner: string,
    repo: string,
    token: string,
  ): Promise<RepositoryContributor[]> {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/contributors`;
      const { data } = await firstValueFrom(
        this.httpService.get<RepositoryContributor[]>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
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

  async getAllPullRequests(owner: string, repo: string, token: string) {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls?state=all`;
      const { data } = await firstValueFrom(
        this.httpService.get<GitHubPullRequest[]>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
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
    token: string,
    startDate: string,
    endDate: string,
    username: string
  ): Promise<any> {
    try {
      const url = `${this.baseUrl}/search/issues?q=type:pr+author:${username}+repo:${owner}/${repo}+created:${startDate}..${endDate}`;
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
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

  async getUsersRepositories(token: string) {
    try {
      const url = 'https://api.github.com/user/repos';
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
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
