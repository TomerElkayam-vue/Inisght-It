export type IssueWithMrAndChangelog = {
  id: string;
  name: string;
  title: string;
  assignee: string;
  owner: string;
  sprint: number;
  created: string; // ISO 8601 with timezone offset
  createdAt: string; // ISO 8601 UTC
  mergedAt: string;
  inProgress?: string;
};
