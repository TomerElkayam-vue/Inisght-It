import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ProjectsSerivce } from '../projects/project.service';

@Injectable()
export class ProjectSettingsMiddleware implements NestMiddleware {
  constructor(private readonly projectsSerivce: ProjectsSerivce) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.query?.projectId)
      throw new HttpException('Bad Request - Project id is required', HttpStatus.BAD_REQUEST);

    const projectSettings = await this.projectsSerivce.getProject({
      id: req.query.projectId?.toString(),
    });

    if (!projectSettings) {
      throw new HttpException('Bad Request - Project does not exist', HttpStatus.BAD_REQUEST);
    }
    
    const { missionManagementCredentials, codeRepositoryCredentials } =
      projectSettings;

    req.missionManagementCredentials = missionManagementCredentials;
    req.codeRepositoryCredentials = codeRepositoryCredentials;

    next();
  }
}
