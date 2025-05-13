import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async getEmployees() {
    return this.prisma.employee.findMany();
  }

  async findEmployeeByJiraUsername(jiraUsername: string) {
    return this.prisma.employee.findFirst({
      where: {
        jiraUsername: jiraUsername,
      },
    });
  }
}
