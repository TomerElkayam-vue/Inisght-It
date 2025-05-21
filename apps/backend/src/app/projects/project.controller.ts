import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ProjectsSerivce } from './project.service';
import { Prisma } from '@prisma/client';
import { ApiBody } from '@nestjs/swagger';
import { CreateProjectDto } from './dto/CreateProjectDto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectsSerivce) {}

  @Get('')
  getAllProjects() {
    return this.projectService.getProjects({});
  }

  @Get('/user/:userId')
  getEmployeeProjects(@Param('userId') userId: string) {
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
  createProject(@Body() project: Prisma.ProjectCreateInput) {
    return this.projectService.createProject(project);
  }

  @Put('/:id')
  updateProject(
    @Param('id') id: string,
    @Body() project: Prisma.ProjectUpdateInput
  ) {
    return this.projectService.updateProject({ where: { id }, data: project });
  }
}
