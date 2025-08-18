import { Controller, Get, Post, Body, Param, Put, Req } from '@nestjs/common';
import { ProjectsSerivce } from './project.service';
import { Prisma } from '@prisma/client';
import { ApiBody } from '@nestjs/swagger';
import { CreateProjectDto } from './dto/CreateProjectDto';
import { Request } from 'express';

export interface AuthenticatedUser {
  sub: string; 
}

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
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
    // Extract user ID from the token (populated by AuthMiddleware)
    const userId = req.user?.sub; 
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
    // Extract user ID from the token (populated by AuthMiddleware)
    const userId = req.user?.sub; 
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
