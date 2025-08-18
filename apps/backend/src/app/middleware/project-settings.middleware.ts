import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ProjectsSerivce } from '../projects/project.service';
import { AuthenticatedUser } from '../projects/project.controller';

interface RequestWithProjectCredentials extends Request {
  projectCredentials?: {
    missionManagementCredentials: Record<string, any> | null;
    codeRepositoryCredentials: Record<string, any> | null;
    user?: AuthenticatedUser;
  };
}

@Injectable()
export class ProjectSettingsMiddleware implements NestMiddleware {
  constructor(private readonly projectsSerivce: ProjectsSerivce) {}

  async use(
    req: RequestWithProjectCredentials,
    res: Response,
    next: NextFunction
  ) {
    if ((!req.user || !req.user.sub) && !req.originalUrl.includes('callback')) {
      throw new HttpException(
        'Unauthorized - User not authenticated',
        HttpStatus.UNAUTHORIZED
      );
    }

    if (!req.query?.projectId) {
      throw new HttpException(
        'Bad Request - Project id is required',
        HttpStatus.BAD_REQUEST
      );
    }

    const projectSettings = await this.projectsSerivce.getProject({
      id: req.query.projectId?.toString(),
    });

    if (!projectSettings) {
      throw new HttpException(
        'Bad Request - Project does not exist',
        HttpStatus.BAD_REQUEST
      );
    }

    const { missionManagementCredentials, codeRepositoryCredentials } =
      projectSettings;

    // credentials and user info to the request for use in controllers
    req.projectCredentials = {
      missionManagementCredentials: missionManagementCredentials as Record<
        string,
        any
      > | null,
      codeRepositoryCredentials: codeRepositoryCredentials as Record<
        string,
        any
      > | null,
    };

    next();
  }
}
