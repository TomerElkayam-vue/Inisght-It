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
  constructor(
    private readonly httpService: HttpService,
    @Inject(jiraConfig.KEY)
    private jiraConfigValues: ConfigType<typeof jiraConfig>
  ) {}

  async getJiraIssues(
    projectSettings: JiraSettings,
    dataType: JiraDataType | JiraAvgDataType
  ): Promise<JiraTaskDto['fields'][]> {
    try {
      // TODO - replace 1 with boardId
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

      return response.data.issues.map((issue: any) =>
        jiraDataTypeTransformation[dataType].transformFunction(issue.fields)
      );
    } catch (error: any) {
      console.log('Error', error.status);
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
      console.log('Error', error.status);
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

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      };
    } catch (error: any) {
      console.log('Error', error.status);
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
      console.log('Error', error.status);
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
      console.log('Error', e.status);
      throw e;
    }
  }
}
