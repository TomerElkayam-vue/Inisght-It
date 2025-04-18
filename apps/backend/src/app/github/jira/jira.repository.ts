import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JiraTaskDto } from './dto/jira-task.dto';

@Injectable()
export class JiraRepository {
  constructor(private readonly httpService: HttpService) {}

  async getJiraIssues(): Promise<JiraTaskDto[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('/rest/api/2/search', {
          params: {
            jql: 'assignee IS NOT EMPTY',
            fields: 'assignee',
            maxResults: 100,
            startAt: 0,
          },
        })
      );

      return response.data.issues;
    } catch (error) {
      console.error('Error fetching Jira issues:', error);
      return [];
    }
  }
}
