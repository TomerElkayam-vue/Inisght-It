import { registerAs } from "@nestjs/config";

export interface GithubConfig {
  oauthClientId: string;
  oauthClientToken: string;
  oauthRedirectURI: string;
}

export const githubConfig = registerAs("github", () => ({
  oauthClientId: process.env.GITHUB_OAUTH_CLIENT_ID,
  oauthClientToken: process.env.GITHUB_OAUTH_CLIENT_SECRET,
  oauthRedirectURI: process.env.GITHUB_REDIRECT_URI,
}));
