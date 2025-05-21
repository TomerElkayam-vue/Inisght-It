import { Controller, Get, Param, Query, Res, Req } from "@nestjs/common";
import { GithubRemoteService } from "./remote/github-remote.service";
import { GithubService } from "./db/github.service";
import { SprintCommentsPerUser } from "@packages/github";

@Controller("github")
export class GithubController {
  constructor(
    private readonly GithubRemoteService: GithubRemoteService,
    private readonly GithubService: GithubService
  ) {}
  //TODO: REPLACE WITH PATH WITH ONLY PROJECT ID
  @Get(":owner/:repo/project-stats")
  async getProjectStats(
    @Param("owner") owner: string,
    @Param("repo") repo: string,
    @Query("projectId") projectId: string,
    @Req() req: any
  ): Promise<SprintCommentsPerUser[]> {
    // console.log('Project Stats Route - Credentials:');
    // console.log(
    //   'missionManagementCredentials:',
    //   req.projectCredentials?.missionManagementCredentials
    // );
    // console.log(
    //   'codeRepositoryCredentials:',
    //   req.projectCredentials?.codeRepositoryCredentials
    // );

    const sprintStats = await this.GithubService.getSprintStatsByProjectId(projectId);
    return sprintStats.map(sprint => ({
      ...sprint,
      userStats: sprint.userStats.map(userStat => ({
        ...userStat,
        totalPrTime: Number(userStat.totalPrTime),
      })),
    }));
  }

  @Get("/callback")
  async githubCallback(
    // This is a type and not a string because the it's a redirect from github, causing the parameter to be sent as an object
    @Query("projectId") projectId: string,
    @Query("code") code: string,
    @Res() res: any,
    @Req() req: any
  ) {
    console.log("GitHub Callback Route - Credentials:");
    console.log(
      "missionManagementCredentials:",
      req.projectCredentials?.missionManagementCredentials
    );
    console.log(
      "codeRepositoryCredentials:",
      req.projectCredentials?.codeRepositoryCredentials
    );
    const token = await this.GithubRemoteService.getUserGithubToken(
      code,
      projectId
    );

    // For dev: pass token in URL (insecure for prod)
    return res.redirect(`http://localhost:4200/github-success?token=${token}`);
  }
}
