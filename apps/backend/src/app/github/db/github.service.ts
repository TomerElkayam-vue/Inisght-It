import { Injectable } from "@nestjs/common";
import { GithubRemoteRepository } from "../remote/github-remote.reposetory";
import { RepositoryContributor } from "@packages/github";
import { PrismaService } from "../../prisma/prisma.service";
import { ProjectsSerivce } from "../../projects/project.service";

@Injectable()
export class GithubService {
  constructor(
    private readonly GithubRemoteRepository: GithubRemoteRepository,
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsSerivce
  ) {}

  async getUserPullRequests(
    owner: string,
    repo: string,
    token: string,
    startDate: string,
    endDate: string,
    username: string
  ): Promise<RepositoryContributor[]> {
    return this.GithubRemoteRepository.getOpenPullRequestsBetweenDates(
      owner,
      repo,
      token,
      startDate,
      endDate,
      username
    );
  }

  async getSprintStatsByProjectId(projectId: string) {
    const sprints = await this.prisma.sprint.findMany({
      where: {
        projectId,
      },
      include: {
        userStats: {
          include: {
            employee: true,
            pullRequests: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return sprints.map((sprint) => ({
      sprintId: sprint.id,
      sprintName: sprint.name,
      startDate: sprint.startDate.toISOString(),
      endDate: sprint.endDate.toISOString(),
      userStats: sprint.userStats.map((userStat) => ({
        login: userStat.employee.displayName,
        employeeId: userStat.employeeId,
        totalReviewComments: userStat.totalReviewComments,
        totalPrTime: userStat.totalPrTime,
        averageCommentsPerPR: userStat.averageCommentsPerPR,
        averagePrTime: userStat.averagePrTime,
        pullRequests: userStat.pullRequests.map((pr) => ({
          prNumber: pr.prNumber,
          prTitle: pr.prTitle,
          reviewComments: pr.reviewComments,
        })),
      })),
    }));
  }

  async updateGithubProjectOnProject(
    projectId: string,
    githubProject: { id: string; name: string; owner: string }
  ) {
    const currentCodeRepositoryCredentials = (
      await this.projectsService.getProject({ id: projectId })
    )?.codeRepositoryCredentials as any;

    const settings = {
      ...currentCodeRepositoryCredentials,
      ...githubProject
    };

    await this.projectsService.updateProject({
      where: { id: projectId },
      data: { codeRepositoryCredentials: settings },
    });
  }
}
