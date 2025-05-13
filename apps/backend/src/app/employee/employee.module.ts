import { Module } from "@nestjs/common";
import { EmployeeService } from "./employee.service";
import { EmployeeRepository } from "./employee.repository";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [EmployeeService, EmployeeRepository],
  exports: [EmployeeService],
})
export class EmployeeModule {}
