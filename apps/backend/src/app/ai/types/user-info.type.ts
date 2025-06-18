export interface UserInfo {
  pullRequests: number;
  codeReviews: number;
  averageCommentsUserGotPerPR: number;
  commits: number;
  fileChanges: {
    additions: number;
    deletions: number;
  };
  comments: number;
  issuesCompleted: number;
  averageIssueTime: number;
  totalStoryPoints: number;
  issueTypes: {
    Task: number;
    Bug: number;
  };
}
