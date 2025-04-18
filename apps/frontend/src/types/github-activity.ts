export interface PullRequestActivity {
  prNumber: number;
  prTitle: string;
  comments: number;
  reviewComments: number;
  issueComments: number;
}

export interface UserActivity {
  login: string;
  totalComments: number;
  totalReviewComments: number;
  totalIssueComments: number;
  pullRequests: PullRequestActivity[];
  averageCommentsPerPR: number;
}
