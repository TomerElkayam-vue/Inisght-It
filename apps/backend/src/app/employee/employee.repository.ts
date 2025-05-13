import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Employee } from "@prisma/client";

@Injectable()
export class EmployeeRepository {
  constructor(private prisma: PrismaService) {}

  async getEmployees(): Promise<Employee[]> {
    return this.prisma.employee.findMany();
  }

  async findEmployeeByJiraUsername(
    jiraUsername: string
  ): Promise<Employee | null> {
    return this.prisma.employee.findFirst({
      where: {
        jiraUsername: jiraUsername,
      },
    });
  }

  async findEmployeeByGithubUsername(
    githubUsername: string
  ): Promise<Employee | null> {
    return this.prisma.employee.findFirst({
      where: {
        githubUsername: githubUsername,
      },
    });
  }
}
