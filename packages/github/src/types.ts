export type GitHubUser = {
  login?: string;
  id?: number;
  node_id?: string;
  avatar_url?: string;
  gravatar_id?: string;
  url?: string;
  html_url?: string;
  followers_url?: string;
  following_url?: string;
  gists_url?: string;
  starred_url?: string;
  subscriptions_url?: string;
  organizations_url?: string;
  repos_url?: string;
  events_url?: string;
  received_events_url?: string;
  type?: string;
  site_admin?: boolean;
};

export type UserPullRequestStats = {
  prNumber: number;
  prTitle: string;
  reviewComments: number;
};

export type UserSpecificStats = {
  login: string;
  employeeId: string;
  totalReviewComments: number;
  pullRequests: UserPullRequestStats[];
  averageCommentsPerPR: number;
  totalPrTime: number;
  averagePrTime: number;
};

export type SprintCommentsPerUser = {
  sprintId: number;
  sprintName: string;
  startDate: string;
  endDate: string;
  userStats: UserSpecificStats[];
};

export type GitHubPullRequest = {
  title?: string;
  id: number;
  number: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  user?: GitHubUser;
  userName?: string;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
};

export type RepositoryContributor = {
  created_at: number;
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  contributions: number;
  contributions_per_week: number;
  pull_requests: number;
  issues: number;
  commits: number;
};
