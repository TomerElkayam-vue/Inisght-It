import { ConfigType, registerAs } from '@nestjs/config';

export const jiraConfig = registerAs('jira', () => ({
  jiraUrl: process.env.JIRA_URL,
  email: process.env.EMAIL,
  apiToken: process.env.API_TOKEN,
}));

export type JiraConfig = ConfigType<typeof jiraConfig>;
