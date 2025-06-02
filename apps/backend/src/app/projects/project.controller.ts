import { Controller, Get, Post, Body, Param, Put, Req } from '@nestjs/common';
import { ProjectsSerivce } from './project.service';
import { Prisma } from '@prisma/client';
import { ApiBody } from '@nestjs/swagger';
import { CreateProjectDto } from './dto/CreateProjectDto';
import { Request } from 'express';

export interface AuthenticatedUser {
  sub: string; // Define the expected structure of the user object
}

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser; // Extend the Request interface to include user
  }
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectsSerivce) {}

  @Get('')
  getAllProjects() {
    return this.projectService.getProjects({});
  }

  @Get('/user')
  getUserProjects(@Req() req: Request) {
    const userId = req.user?.sub; // Extract user ID from the token (populated by AuthMiddleware)
    if (!userId) {
      throw new Error('User ID is undefined');
    }
    return this.projectService.getProjects({
      where: {
        projectPermissions: {
          some: {
            userId: userId,
          },
        },
      },
    });
  }

  @Get('/:id')
  getProjectByid(@Param('id') id: string) {
    return this.projectService.getProject({ id });
  }

  @Post('')
  @ApiBody({ type: CreateProjectDto })
  createProject(
    @Body() project: Prisma.ProjectCreateInput,
    @Req() req: Request
  ) {
    const userId = req.user?.sub; // Extract user ID from the token (populated by AuthMiddleware)
    if (!userId) {
      throw new Error('User ID is undefined');
    }
    return this.projectService.createProject(project, userId);
  }

  @Put('/:id')
  updateProject(
    @Param('id') id: string,
    @Body() project: Prisma.ProjectUpdateInput
  ) {
    return this.projectService.updateProject({ where: { id }, data: project });
  }
}
