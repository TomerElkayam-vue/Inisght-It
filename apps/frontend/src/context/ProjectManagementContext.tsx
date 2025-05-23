import { User } from '@prisma/client';
import { createContext, useContext, useState } from 'react';

type CodeBaseCredentials = {
  repoOwner?: string;
  repoName?: string;
};

type ManagementCredentials = {
  email?: string;
  jiraUrl?: string;
  apiToken?: string;
  boardId?: string;
};

type ProjectContextType = {
  employees: User[];
  setEmployees: React.Dispatch<React.SetStateAction<User[]>>;
  codeBaseCredentials: CodeBaseCredentials | null;
  setCodeBaseCredentials: (credentials: CodeBaseCredentials | null) => void;
  managementCredentials: ManagementCredentials | null;
  setManagementCredentials: (credentials: ManagementCredentials | null) => void;
};

const ProjectManagementContext = createContext<ProjectContextType | undefined>(
  undefined
);

export const ProjectManagementProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [codeBaseCredentials, setCodeBaseCredentials] =
    useState<CodeBaseCredentials | null>(null);
  const [managementCredentials, setManagementCredentials] =
    useState<ManagementCredentials | null>(null);

  return (
    <ProjectManagementContext.Provider
      value={{
        employees,
        setEmployees,
        codeBaseCredentials: codeBaseCredentials,
        setCodeBaseCredentials: setCodeBaseCredentials,
        managementCredentials: managementCredentials,
        setManagementCredentials: setManagementCredentials,
      }}
    >
      {children}
    </ProjectManagementContext.Provider>
  );
};

export const useProjectManagementContext = () => {
  const context = useContext(ProjectManagementContext);
  if (!context) {
    throw new Error(
      'useProjectManagementContext must be used within a ProjectManagementProvider'
    );
  }
  return context;
};
