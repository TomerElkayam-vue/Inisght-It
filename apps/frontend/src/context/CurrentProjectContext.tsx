import { createContext, useContext, useState } from 'react';
import { Project } from '@packages/projects';

type ProjectContextType = {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
};

const CurrentProjectContext = createContext<ProjectContextType | undefined>(
  undefined
);

export const CurrentProjectProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  return (
    <CurrentProjectContext.Provider
      value={{
        currentProject,
        setCurrentProject: setCurrentProject,
      }}
    >
      {children}
    </CurrentProjectContext.Provider>
  );
};

export const useCurrentProjectContext = () => {
  const context = useContext(CurrentProjectContext);
  if (!context) {
    throw new Error(
      'useCurrentProjectContext must be used within a CurrentProjectProvider'
    );
  }
  return context;
};
