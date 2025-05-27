import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
// import { GithubRemoteService } from '../github/remote/github-remote.service';

@Injectable()
export class CronService {
  // constructor(private readonly GithubRemoteService: GithubRemoteService) {}

  @Cron('*/5 * * * *')
  async handleCustomCron() {
    console.log('Running scheduled query from DB every 5 minutes');
    //TODO: replace with loop on the project from the DB
    //TODO: get project managment credencials
    // this.GithubRemoteService.getProjectStats(
    //   'TomerElkayam-vue',
    //   'Inisght-It',
    //   {},
    //   'projectId'
    // );
  }
}
