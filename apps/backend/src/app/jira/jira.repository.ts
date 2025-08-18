import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JiraTaskDto } from './dto/jira-task.dto';
import { jiraConfig } from '../../config/jira-config';
import { ConfigType } from '@nestjs/config';
import axios from 'axios';
import { JiraSettings } from './types/jira-settings.type';
import { JiraDataType } from './enums/jira-data-type.enum';
import { jiraDataTypeTransformation } from './mappers/jira-data-type-transformation';
import { JiraAvgDataType } from './enums/jira-avg-data-type.enum';

@Injectable()
export class JiraRepository {
  private apiEndpoint: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject(jiraConfig.KEY)
    private jiraConfigValues: ConfigType<typeof jiraConfig>
  ) {
    this.apiEndpoint = process.env.API_URL || 'http://localhost:3000/api';
    this.httpService.axiosRef.defaults.timeout = 60000;
  }

  async getJiraIssues(
    projectSettings: JiraSettings,
    dataType: JiraDataType | JiraAvgDataType
  ): Promise<JiraTaskDto['fields'][]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.atlassian.com/ex/jira/${projectSettings.id}/rest/agile/1.0/board/1/issue`,
          {
            params: {
              jql: 'sprint IS NOT EMPTY and assignee IS NOT EMPTY',
              fields: jiraDataTypeTransformation[dataType].fields,
              maxResults: 100,
              startAt: 0,
            },
            headers: {
              Authorization: `Bearer ${projectSettings.token}`,
              Accept: 'application/json',
            },
          }
        )
      );

      return response.data.issues.map((issue: any) => ({
        ...jiraDataTypeTransformation[dataType].transformFunction(issue.fields),
        id: issue.id,
      }));
    } catch (error: any) {
      // console.log('Error', error);
      throw error;
    }
  }

  async getJiraSprints(projectSettings: JiraSettings): Promise<[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.atlassian.com/ex/jira/${projectSettings.id}/rest/agile/1.0/board/1/sprint`,
          {
            params: {
              startAt: 0,
            },
            headers: {
              Authorization: `Bearer ${projectSettings.token}`,
              Accept: 'application/json',
            },
          }
        )
      );

      return response.data.values;
    } catch (error: any) {
      // console.log('Error', error);
      throw error;
    }
  }

  async getJiraToken(code: string): Promise<any> {
    try {
      const body = JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.jiraConfigValues.clientId,
        client_secret: this.jiraConfigValues.clientSecret,
        code,
        redirect_uri: `${this.apiEndpoint}/jira/callback`,
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

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      };
    } catch (error: any) {
      // console.log('Error', error);
      throw error;
    }
  }

  async refreshJiraToken(currentRefreshToken: string): Promise<any> {
    try {
      const body = JSON.stringify({
        grant_type: 'refresh_token',
        client_id: this.jiraConfigValues.clientId,
        client_secret: this.jiraConfigValues.clientSecret,
        refresh_token: currentRefreshToken,
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

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      };
    } catch (error: any) {
      // console.log('Error', error);
      throw error;
    }
  }

  async getJiraProjects(token: string) {
    try {
      const { data } = await axios.get(
        'https://api.atlassian.com/oauth/token/accessible-resources',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data;
    } catch (e: any) {
      // console.log('Error', e);
      throw e;
    }
  }

  async getIssueChangelog(
    issueId: string,
    projectSettings: JiraSettings
  ): Promise<{
    created: string;
    toDo?: string;
    inProgress?: string;
    done?: string;
  }> {
    const response = await firstValueFrom(
      this.httpService.get(
        `https://api.atlassian.com/ex/jira/${projectSettings.id}/rest/api/3/issue/${issueId}?expand=changelog`,
        {
          headers: {
            Authorization: `Bearer ${projectSettings.token}`,
            Accept: 'application/json',
          },
        }
      )
    );

    const changelog = response.data.changelog.histories;
    const created = response.data.fields.created;

    let toDo: string | undefined;
    let inProgress: string | undefined;
    let done: string | undefined;

    for (const entry of changelog) {
      for (const item of entry.items) {
        if (item.field === 'status') {
          if (!toDo && item.toString === 'To Do') {
            toDo = entry.created;
          }
          if (!inProgress && item.toString === 'In Progress') {
            inProgress = entry.created;
          }
          if (!done && item.toString === 'Done') {
            done = entry.created;
          }
        }
      }
    }

    return { created, toDo, inProgress, done };
  }

  async getProjectContributors(
    projectSettings: JiraSettings
  ): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.atlassian.com/ex/jira/${projectSettings.id}/rest/api/3/search`,
          {
            params: {
              jql: 'project IS NOT EMPTY',
              fields: 'assignee',
              maxResults: 1000,
              startAt: 0,
            },
            headers: {
              Authorization: `Bearer ${projectSettings.token}`,
              Accept: 'application/json',
            },
          }
        )
      );

      const contributors = new Set<string>();
      response.data.issues.forEach((issue: any) => {
        if (issue.fields.assignee?.displayName) {
          contributors.add(issue.fields.assignee.displayName);
        }
      });

      return Array.from(contributors);
    } catch (error: any) {
      // console.log('Error fetching project contributors:', error);
      throw error;
    }
  }
}
