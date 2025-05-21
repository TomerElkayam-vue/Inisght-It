import { Module } from "@nestjs/common";
import { CronService } from "./cron.service";
import { GithubModule } from "../github/github.module";

@Module({
  imports: [GithubModule],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
