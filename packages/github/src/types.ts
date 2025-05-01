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

export type RepositoryUser = {
  login: string;
  id: number;
  type: string;
  site_admin: boolean;
  contributions: number;
  pullRequests: number;
  comments: number;
  reviews: number;
};

export type PullRequestDuration = {
  days: number;
  hours: number;
  minutes: number;
  isOpen: boolean;
};

export type UserCommentsStats = {
  login: string;
  reviewComments: number;
};

export type UserPullRequestStats = {
  prNumber: number;
  prTitle: string;
  reviewComments: number;
};

export type UserSpecificStats = {
  login: string;
  totalReviewComments: number;
  pullRequests: UserPullRequestStats[];
  averageCommentsPerPR: number;
  totalPrTime: number;
  averagePrTime: number;
};

export type SprintCommentsPerUser = {
  sprintId: number;
  sprintName: string;
  userStats: UserSpecificStats[];
};

export interface ProjectCommentsStats {
  totalPullRequests: number;
  totalComments: number;
  userStats: UserSpecificStats[];
  averageCommentsPerPR: number;
  mostActiveReviewer: {
    login: string;
    totalComments: number;
  };
}

export type GitHubPullRequest = {
  id: number;
  number: number;
  title: string;
  state: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  user?: GitHubUser;
  draft?: boolean;
  html_url: string;
  review_comments_url: string;
  comments_url: string;
  duration?: PullRequestDuration;
  commentsStats?: UserCommentsStats[];
};

export type GitHubReview = {
  id: number;
  user?: GitHubUser;
  state: string;
  submitted_at: string;
  body?: string;
  commit_id: string;
};

export type GitHubComment = {
  id: number;
  user?: GitHubUser;
  body: string;
  created_at: string;
  updated_at: string;
  path: string;
  line?: number;
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
