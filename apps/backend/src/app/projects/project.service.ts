import { Injectable } from '@nestjs/common';
import { Prisma, Project } from '@prisma/client';
import { ProjectsRepository } from './project.repository';

@Injectable()
export class ProjectsSerivce {
  constructor(private projectsRepository: ProjectsRepository) {}

  async getProject(
    projectWhereUniqueInput: Prisma.ProjectWhereUniqueInput
  ): Promise<Project | null> {
    return this.projectsRepository.getProject(projectWhereUniqueInput);
  }

  async getProjects(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProjectWhereUniqueInput;
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<Project[]> {
    return this.projectsRepository.getProjects(params);
  }

  async createProject(
    data: Prisma.ProjectCreateInput,
    userId: string
  ): Promise<Project> {
    return this.projectsRepository.createProject(data, userId);
  }

  async updateProject(params: {
    where: Prisma.ProjectWhereUniqueInput;
    data: Prisma.ProjectUpdateInput;
  }): Promise<Project> {
    return this.projectsRepository.updateProject(params);
  }

  async deleteProject(where: Prisma.ProjectWhereUniqueInput): Promise<Project> {
    return this.projectsRepository.deleteProject(where);
  }
}
