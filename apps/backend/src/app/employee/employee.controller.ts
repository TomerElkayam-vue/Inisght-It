import { Controller, Post, Query, Req } from '@nestjs/common';
import { EmployeeService } from './employee.service';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('connect-names')
  async connectEmployeesNames(
    @Query('projectId') projectId: string,
    @Req() req: any
  ) {
    return await this.employeeService.connectEmployeesNames(
      projectId,
      req.projectCredentials
    );
  }
}
