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
      include: {
        projectPermissions: { include: { user: true, role: true } },
        employees: true,
      },
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
      include: {
        projectPermissions: { include: { user: true, role: true } },
        employees: true,
      },
    });
  }

  async createProject(
    data: Prisma.ProjectCreateInput,
    userId: string
  ): Promise<Project> {
    const project = await this.prisma.project.create({ data });

    await this.prisma.projectPermission.create({
      data: {
        userId,
        projectId: project.id,
        roleId: 1,
      },
    });

    return project;
  }

  async updateProject(params: {
    where: Prisma.ProjectWhereUniqueInput;
    data: Prisma.ProjectUpdateInput;
  }): Promise<Project> {
    const { where, data } = params;
    return this.prisma.project.update({
      data,
      where,
      include: {
        projectPermissions: { include: { user: true, role: true } },
        employees: true,
      },
    });
  }

  async deleteProject(where: Prisma.ProjectWhereUniqueInput): Promise<Project> {
    return this.prisma.project.delete({
      where,
    });
  }
}
