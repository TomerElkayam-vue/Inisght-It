import { Injectable } from "@nestjs/common";
import { Employee } from "@prisma/client";
import { EmployeeRepository } from "./employee.repository";

@Injectable()
export class EmployeeService {
  constructor(private employeeRepository: EmployeeRepository) {}

  async getEmployees(): Promise<Employee[]> {
    return this.employeeRepository.getEmployees();
  }

  async findEmployeeByJiraUsername(
    jiraUsername: string
  ): Promise<Employee | null> {
    return this.employeeRepository.findEmployeeByJiraUsername(jiraUsername);
  }

  async findEmployeeByGithubUsername(
    githubUsername: string
  ): Promise<Employee | null> {
    return this.employeeRepository.findEmployeeByGithubUsername(githubUsername);
  }
}
