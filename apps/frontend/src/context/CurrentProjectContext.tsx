import { createContext, useContext, useEffect, useState } from 'react';
import { Project } from '@packages/projects';
import { projectsService } from '../services/projects.service';

type ProjectContextType = {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  refreshCurrentProject: () => Promise<void>;
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

  const refreshCurrentProject = async () => {
    if (currentProject?.id) {
      try {
        const freshProject = await projectsService.getProject(
          currentProject.id
        );
        setCurrentProject(freshProject);
        localStorage.setItem('currentProject', JSON.stringify(freshProject));
      } catch (err) {
        console.error('Error refreshing project:', err);
      }
    }
  };

  const changeProject = (project: Project | null) => {
    if (project) {
      localStorage.setItem('currentProject', JSON.stringify(project));
      setCurrentProject(project);
    }
  };

  useEffect(() => {
    const storedProject = localStorage.getItem('currentProject');
    if (storedProject) {
      try {
        const parsedProject = JSON.parse(storedProject);
        setCurrentProject(parsedProject);
        // Fetch fresh data after setting initial state
        if (parsedProject.id) {
          refreshCurrentProject();
        }
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
        refreshCurrentProject,
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
