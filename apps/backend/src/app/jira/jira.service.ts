import { Injectable } from '@nestjs/common';
import { JiraRepository } from './jira.repository';
import { JiraSprintDto } from './dto/jira-sprint.dto';
import { JiraIssueCountDto } from './dto/jira-issue-count';

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

  async countJiraIssuesBySprintPerUser(): Promise<JiraIssueCountDto[]> {
    const sprints = await this.getJiraSprints();
    const blankStats = sprints.reduce((acc, curr) => {
      acc[curr.name] = 0;
      return acc;
    }, {} as Record<string, number>);

    const issues = await this.getJiraIssues();
    const issueCounts: JiraIssueCountDto[] = [];


    issues.forEach((issue) => {
      const assignee: string =
        issue.fields.assignee?.displayName || 'Unassigned';
      const sprint: string =
        issue.fields.sprint?.name || 'Backlog';
      
        let currUser = issueCounts.find(o => o.name == assignee);

      if (!currUser) {
        currUser = {name: assignee, stats: structuredClone(blankStats)}
        issueCounts.push(currUser);
      }       

      currUser.stats[sprint] ++;
    });

    return issueCounts;
  }
}
