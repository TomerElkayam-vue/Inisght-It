import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { GithubRemoteService } from "../remote/github-remote.service";
import { GithubService } from "./github.service";
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
    @Param("repo") repo: string
  ): Promise<SprintCommentsPerUser[]> {
    const projectId = "381be2c1-012f-44c7-818a-6d78f4ad2067";
    return this.GithubService.getSprintStatsByProjectId(projectId);
  }

  @Get(":owner/:repo/users/:username/prs")
  async getUserPullRequests(
    @Param("owner") owner: string,
    @Param("repo") repo: string,
    @Param("username") username: string,
    @Query("from") from: string,
    @Query("to") to: string
  ): Promise<any[]> {
    return this.GithubRemoteService.getUserPullRequests(
      owner,
      repo,
      from,
      to,
      username
    );
  }

  @Get("callback/:projectId")
  async githubCallback(
    // This is a type and not a string because the it's a redirect from github, causing the parameter to be sent as an object
    @Param() projectId: { projectId: string },
    @Query("code") code: string,
    @Res() res: any
  ) {
    const token = await this.GithubRemoteService.getUserGithubToken(
      code,
      projectId.projectId
    );

    // For dev: pass token in URL (insecure for prod)
    return res.redirect(`http://localhost:4200/github-success?token=${token}`);
  }

  @Get("project/sprint-stats")
  async getSprintStatsByProjectId() {
    const projectId = "381be2c1-012f-44c7-818a-6d78f4ad2067";
    return this.GithubService.getSprintStatsByProjectId(projectId);
  }
}
