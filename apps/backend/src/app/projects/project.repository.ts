import { Injectable } from '@nestjs/common';
import { Prisma, Project } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsRepository {
  constructor(private prisma: PrismaService) {}

  async getProject(
    projectWhereUniqueInput: Prisma.ProjectWhereUniqueInput
  ): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: projectWhereUniqueInput,
      include: { projectPermissions: { include: { user: true, role: true } } },
    });
  }

  async getProjects(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProjectWhereUniqueInput;
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<Project[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.project.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createProject(data: Prisma.ProjectCreateInput): Promise<Project> {
    return this.prisma.project.create({
      data,
    });
  }

  async updateProject(params: {
    where: Prisma.ProjectWhereUniqueInput;
    data: Prisma.ProjectUpdateInput;
  }): Promise<Project> {
    const { where, data } = params;
    return this.prisma.project.update({
      data,
      where,
    });
  }

  async deleteProject(where: Prisma.ProjectWhereUniqueInput): Promise<Project> {
    return this.prisma.project.delete({
      where,
    });
  }
}
