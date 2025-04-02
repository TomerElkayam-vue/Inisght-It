export type GitHubUser = {
  login?: string;
};

export type PullRequestDuration = {
  days: number;
  hours: number;
  minutes: number;
  isOpen: boolean;
};

export type UserCommentsStats = {
  login: string;
  totalComments: number;
  reviewComments: number;
  issueComments: number;
};

export type UserPullRequestStats = {
  prNumber: number;
  prTitle: string;
  comments: number;
  reviewComments: number;
  issueComments: number;
};

export type UserSpecificStats = {
  login: string;
  totalComments: number;
  totalReviewComments: number;
  totalIssueComments: number;
  pullRequests: UserPullRequestStats[];
  averageCommentsPerPR: number;
};

export type ProjectCommentsStats = {
  totalPullRequests: number;
  totalComments: number;
  userStats: UserCommentsStats[];
  averageCommentsPerPR: number;
  mostActiveReviewer: {
    login: string;
    totalComments: number;
  };
};

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