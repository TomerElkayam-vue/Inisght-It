import { Project } from "@packages/projects";
import { createContext, useContext, useEffect, useState } from "react";

export type ProjectContextType = {
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

  const changeProject = (project: Project | null) => {
    project
      ? localStorage.setItem('currentProject', JSON.stringify(project))
      : localStorage.removeItem('currentProject');
    setCurrentProject(project);
  };

  useEffect(() => {
    const storedProject = localStorage.getItem('currentProject');
    if (storedProject) {
      try {
        const parsedProject = JSON.parse(storedProject);
        setCurrentProject(parsedProject);
      } catch (err) {
        console.error('Error parsing stored project:', err);
      }
    }
  }, []);

  return (
    <CurrentProjectContext.Provider
      value={{
        currentProject,
        setCurrentProject: changeProject,
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
