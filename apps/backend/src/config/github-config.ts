import { registerAs } from '@nestjs/config';

export interface GithubConfig {
  token: string;
  owner: string;
  repo: string;
  oauthClientId: string;
  oauthClientToken: string;
  oauthRedirectURI: string;
}

export const githubConfig = registerAs('github', () => ({
  token: process.env.GITHUB_TOKEN,
  owner: process.env.GITHUB_OWNER,
  repo: process.env.GITHUB_REPO,
  oauthClientId: process.env.GITHUB_OAUTH_CLIENT_ID,
  oauthClientToken: process.env.GITHUB_OAUTH_CLIENT_SECRET,
  oauthRedirectURI: process.env.GITHUB_REDIRECT_URI,
}));
