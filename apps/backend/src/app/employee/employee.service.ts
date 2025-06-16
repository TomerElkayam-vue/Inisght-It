import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Employee } from '@prisma/client';
import { EmployeeRepository } from './employee.repository';
import { JiraService } from '../jira/jira.service';
import { AiService } from '../ai/ai.service';
import { GithubService } from '../github/github.service';

@Injectable()
export class EmployeeService {
  constructor(
    private employeeRepository: EmployeeRepository,
    @Inject(forwardRef(() => GithubService))
    private githubService: GithubService,
    @Inject(forwardRef(() => JiraService))
    private jiraService: JiraService,
    private aiService: AiService
  ) {}

  async getEmployees(): Promise<Employee[]> {
    return this.employeeRepository.getEmployees();
  }

  async findEmployeeByJiraUsername(
    jiraUsername: string
  ): Promise<Employee | null> {
    return this.employeeRepository.findEmployeeByJiraUsername(jiraUsername);
  }

  async findEmployeeByGithubUsername(
    githubUsername: string
  ): Promise<Employee | null> {
    return this.employeeRepository.findEmployeeByGithubUsername(githubUsername);
  }

  async findEmployeeById(id: string): Promise<Employee | null> {
    return this.employeeRepository.findEmployeeById(id);
  }

  async connectEmployeesNames(projectId: string, projectSettings: any) {
    const jiraContributors = await this.jiraService.getProjectContributors(
      projectSettings.missionManagementCredentials,
      projectSettings.id
    );

    const githubContributors =
      await this.githubService.getRepositoryContributors(
        projectSettings.codeRepositoryCredentials.owner,
        projectSettings.codeRepositoryCredentials.name,
        projectSettings.codeRepositoryCredentials.token
      );
    const simplifyGithubContributors = githubContributors.map(
      (contributor) => contributor.login
    );

    const matchingContributors = await this.aiService.getArrayMatchingRecord(
      jiraContributors,
      simplifyGithubContributors
    );

    if (matchingContributors) {
      const data = await this.employeeRepository.createManyEmployees(
        Object.entries(matchingContributors)
          .map(([jira, github]) => ({
            displayName: jira,
            jiraUsername: jira,
            githubUsername: github,
            projectId,
          }))
          .filter((entry) => entry.displayName),
        projectId
      );
      return data;
    }
    return [];
  }
}
