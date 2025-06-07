import { Employee, Role, User } from '@prisma/client';

export interface ProjectPermission {
  id: string;
  userId: string;
  projectId: string;
  roleId: number;
  createdAt: Date;
  user: User;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  codeRepositoryCredentials?: Record<string, any> | null;
  missionManagementCredentials?: Record<string, any> | null;
  statistics?: Record<string, any> | null;
  recommendations?: Record<string, any> | null;
  createdAt: Date;
  projectPermissions?: ProjectPermission[];
  employees?: Employee[];
}

export interface ProjectCreateInput {
  name: string;
  codeRepositoryCredentials?: Record<string, any>;
  missionManagementCredentials?: Record<string, any>;
}

export interface ProjectUpdateInput {
  name?: string;
  codeRepositoryCredentials?: Record<string, any> | null;
  missionManagementCredentials?: Record<string, any> | null;
  statistics?: Record<string, any> | null;
  recommendations?: Record<string, any> | null;
  projectPermissions?: {
    create?: {
      userId: string;
      roleId: number;
    }[];
    update?: {
      where: { id: string };
      data: { roleId?: number };
    }[];
    delete?: { id: string }[];
  };
}

export type InsiteitUser = {
  id?: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt?: Date;
};

export type AvgStats = {
  avg: number;
  max: number;
}
