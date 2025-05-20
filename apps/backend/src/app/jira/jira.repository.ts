import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JiraTaskDto } from './dto/jira-task.dto';
import { jiraConfig } from '../../config/jira-config';
import { ConfigType } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class JiraRepository {
  constructor(
    private readonly httpService: HttpService,
    @Inject(jiraConfig.KEY)
    private jiraConfigValues: ConfigType<typeof jiraConfig>
  ) {}

  async getJiraIssues(): Promise<JiraTaskDto[]> {
    try {
      // TODO - replace 1 with boardId
      const response = await firstValueFrom(
        this.httpService.get(`/rest/agile/1.0/board/1/issue`, {
          params: {
            jql: 'sprint IS NOT EMPTY and assignee IS NOT EMPTY',
            fields: 'assignee,sprint',
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

  async getJiraSprints(): Promise<[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('/rest/agile/1.0/board/1/sprint', {
          params: {
            startAt: 0,
          },
        })
      );

      return response.data.values;
    } catch (error) {
      console.error('Error fetching Jira issues:', error);
      return [];
    }
  }

  async getJiraToken(code: string): Promise<any> {
    try {
      const body = JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.jiraConfigValues.clientId,
        client_secret: this.jiraConfigValues.clientSecret,
        code,
        redirect_uri: 'http://localhost:3000/api/jira/callback',
      });

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://auth.atlassian.com/oauth/token',
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      };

      const { data } = await axios.request(config);

      return data.access_token;
    } catch (error: any) {
      console.log(error);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid Jira token');
      }
      throw error;
    }
  }

  async getJiraProjects(token: string) {
    const { data } = await axios.get(
      'https://api.atlassian.com/oauth/token/accessible-resources',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data;
  }
}
