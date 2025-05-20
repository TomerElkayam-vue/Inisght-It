import { Inject, Injectable } from "@nestjs/common";
import * as config from "@nestjs/config";
import { SprintCommentsPerUser } from "@packages/github";
import { githubConfig } from "../../../config/github-config";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class GithubRepository {
  constructor(
    @Inject(githubConfig.KEY)
    private githubConfigValues: config.ConfigType<typeof githubConfig>,
    private readonly prisma: PrismaService
  ) {
    const token = this.githubConfigValues.token;
    if (!token) {
      throw new Error("GitHub token not found in environment variables");
    }
  }

  async storeSprintStats(
    projectId: string,
    sprintStats: SprintCommentsPerUser[]
  ) {
    for (const sprint of sprintStats) {
      await this.prisma.sprint.upsert({
        where: {
          id: sprint.sprintId,
        },
        update: {
          name: sprint.sprintName,
          startDate: new Date(sprint.startDate),
          endDate: new Date(sprint.endDate),
          projectId,
        },
        create: {
          id: sprint.sprintId,
          name: sprint.sprintName,
          startDate: new Date(sprint.startDate),
          endDate: new Date(sprint.endDate),
          projectId,
        },
      });

      for (const userStat of sprint.userStats) {
        const userStatsRecord = await this.prisma.userStats.upsert({
          where: {
            sprintId_employeeId: {
              sprintId: sprint.sprintId,
              employeeId: userStat.employeeId,
            },
          },
          update: {
            totalReviewComments: userStat.totalReviewComments,
            totalPrTime: userStat.totalPrTime,
            averageCommentsPerPR: userStat.averageCommentsPerPR,
            averagePrTime: userStat.averagePrTime,
          },
          create: {
            sprintId: sprint.sprintId,
            employeeId: userStat.employeeId,
            totalReviewComments: userStat.totalReviewComments,
            totalPrTime: userStat.totalPrTime,
            averageCommentsPerPR: userStat.averageCommentsPerPR,
            averagePrTime: userStat.averagePrTime,
          },
        });

        for (const pr of userStat.pullRequests) {
          await this.prisma.pullRequest.upsert({
            where: {
              prNumber_userStatsId: {
                prNumber: pr.prNumber,
                userStatsId: userStatsRecord.id,
              },
            },
            update: {
              prTitle: pr.prTitle,
              reviewComments: pr.reviewComments,
            },
            create: {
              prNumber: pr.prNumber,
              prTitle: pr.prTitle,
              reviewComments: pr.reviewComments,
              userStatsId: userStatsRecord.id,
            },
          });
        }
      }
    }
  }
}
