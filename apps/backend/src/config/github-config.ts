import { registerAs } from '@nestjs/config';

export interface GithubConfig {
  token: string;
  owner: string;
  repo: string;
}

export const githubConfig = registerAs('github', () => ({
  token: process.env.GITHUB_TOKEN,
  owner: process.env.GITHUB_OWNER,
  repo: process.env.GITHUB_REPO,
})); 