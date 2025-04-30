import { Injectable } from '@nestjs/common';
import { JiraRepository } from './jira.repository';
import { JiraSprintDto } from './dto/jira-sprint.dto';

@Injectable()
export class JiraService {
  constructor(private readonly jiraRepository: JiraRepository) {}

  async getJiraIssues() {
    return this.jiraRepository.getJiraIssues();
  }

  async getJiraSprints() {
    const jiraSprints = await this.jiraRepository.getJiraSprints();
    
    return jiraSprints.map((sprint: any): JiraSprintDto => ({
      id: sprint.id,
      name: sprint.name,
      startDate: sprint.startDate ?? null,
      endDate: sprint.endDate ?? null,
      state: sprint.state,
    }));
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
