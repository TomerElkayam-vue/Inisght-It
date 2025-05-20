import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { GithubController } from "./github.controller";
import { GithubRemoteService } from "./remote/github-remote.service";
import { GithubService } from "./db/github.service";
import { GithubRemoteRepository } from "./remote/github-remote.reposetory";
import { GithubRepository } from "./db/github.reposetory";
import { githubConfig } from "../../config/github-config";
import { ProjectsModule } from "../projects/project.module";
import { JiraModule } from "../jira/jira.module";
import { EmployeeModule } from "../employee/employee.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    ProjectsModule,
    ConfigModule.forFeature(githubConfig),
    HttpModule,
    JiraModule,
    EmployeeModule,
    PrismaModule,
  ],
  controllers: [GithubController],
  providers: [
    GithubRemoteService,
    GithubService,
    GithubRepository,
    GithubRemoteRepository,
  ],
  exports: [GithubRemoteService, GithubService],
})
export class GithubModule {}
