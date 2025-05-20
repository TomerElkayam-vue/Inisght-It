import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ProjectsSerivce } from '../projects/project.service';

// Extend Express Request type to include projectCredentials
interface RequestWithProjectCredentials extends Request {
  projectCredentials?: {
    missionManagementCredentials: Record<string, any> | null;
    codeRepositoryCredentials: Record<string, any> | null;
  };
}

@Injectable()
export class ProjectSettingsMiddleware implements NestMiddleware {
  constructor(private readonly projectsSerivce: ProjectsSerivce) {}

  async use(req: RequestWithProjectCredentials, res: Response, next: NextFunction) {
    if (!req.query?.projectId)
      throw new HttpException('Bad Request - Project id is required', HttpStatus.BAD_REQUEST);

    const projectSettings = await this.projectsSerivce.getProject({
      id: req.query.projectId?.toString(),
    });

    if (!projectSettings) {
      throw new HttpException('Bad Request - Project does not exist', HttpStatus.BAD_REQUEST);
    }
    
    const { missionManagementCredentials, codeRepositoryCredentials } = projectSettings;

    // Attach credentials to request for use in controllers
    req.projectCredentials = {
      missionManagementCredentials: missionManagementCredentials as Record<string, any> | null,
      codeRepositoryCredentials: codeRepositoryCredentials as Record<string, any> | null
    };

    next();
  }
}
