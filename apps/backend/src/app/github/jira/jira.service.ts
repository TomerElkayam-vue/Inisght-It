import { Injectable } from '@nestjs/common';
import { JiraRepository } from './jira.repository';

@Injectable()
export class JiraService {
  constructor(private readonly jiraRepository: JiraRepository) {}

  async getJiraIssues() {
    return this.jiraRepository.getJiraIssues();
  }

  async getJiraSprints() {
    return this.jiraRepository.getJiraSprints();
  }

  async countJiraIssuesPerUser(): Promise<Record<string, number>> {
    const issues = await this.getJiraIssues();
    const issueCounts: Record<string, number> = {};

    issues.forEach((issue) => {
      const assignee: string =
        issue.fields.assignee?.displayName || 'Unassigned';
      issueCounts[assignee] = (issueCounts[assignee] ?? 0) + 1;
    });

    return issueCounts;
  }
}
