import { createContext, useContext, useState } from 'react';

type CodeBaseCredentials = {
  repoOwner?: string;
  repoName?: string;
};

type ManagmentCredentials = {
  email?: string;
  jiraUrl?: string;
  apiToken?: string;
  boardId?: string;
};

type ProjectContextType = {
  employees: string[];
  setEmployees: (employees: string[]) => void;
  codeBaseCredentials: CodeBaseCredentials | null;
  setCodeBaseCredentials: (creds: CodeBaseCredentials) => void;
  managmentCredentials: ManagmentCredentials | null;
  setManagmentCredentials: (creds: ManagmentCredentials) => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const [employees, setEmployees] = useState<string[]>([
    'תומר אלקיים',
    'נעם יפעת',
    'ניצן חמצני',
    'רון ארוך',
  ]);
  const [codeBaseCredentials, setCodeBaseCredentials] = useState<CodeBaseCredentials | null>(null);
  const [managmentCredentials, setManagmentCredentials] = useState<ManagmentCredentials | null>(null);

  return (
    <ProjectContext.Provider value={{ 
      employees, 
      setEmployees, 
      codeBaseCredentials: codeBaseCredentials, 
      setCodeBaseCredentials: setCodeBaseCredentials,
      managmentCredentials: managmentCredentials, 
      setManagmentCredentials: setManagmentCredentials 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};
