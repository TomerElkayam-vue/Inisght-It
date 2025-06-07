import { useEffect, useRef, useState } from 'react';
import { getProjects, updateJiraProjectOnProject } from '../../services/jira.service';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { Project } from '@prisma/client';

export type JiraProjectSelectorProps = {
  jiraSuccess: string | null;
  currentProject: any;
};

const JiraProjectSelector = ({ jiraSuccess, currentProject }: JiraProjectSelectorProps) => {
  const [projects, setProjects] = useState<any>([]);
  const [selectedJiraProject, setSelectedJiraProject] = useState<any>(null);
  const { setCurrentProject } = useCurrentProjectContext();
  const [isLoading, setIsLoading] = useState(false);
  const prevRef = useRef(selectedJiraProject);

  useEffect(() => {
    const fetchData = async () => {
      if (jiraSuccess && currentProject?.id && prevRef.current === selectedJiraProject) {
        setIsLoading(true);
        setProjects(await getProjects(currentProject.id));
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentProject, selectedJiraProject]);

  useEffect(() => {
    prevRef.current = selectedJiraProject
  }, [selectedJiraProject]);

  const handleSelectProject = async (value: string) => {
    try {
      const selected = JSON.parse(value);
      setSelectedJiraProject(value);
      //@ts-ignore
      setCurrentProject((prev: Project | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          missionManagementCredentials: {
            ...((prev.missionManagementCredentials as object) || {}),
            name: selected.name,
          },
        };
      });
      await updateJiraProjectOnProject(currentProject?.id ?? '', {
        projectId: selected.id,
        projectName: selected.name,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    isLoading ? (
      <div className="flex justify-center items-center h-11">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    ) : projects.length > 0 ? (
      <div className="mt-4">
        <select
          className="w-full p-3 rounded-lg bg-[#3a3a4d] border-none focus:outline-none text-white text-right"
          value={selectedJiraProject || ''}
          onChange={e => handleSelectProject(e.target.value)}
        >
          <option value="">בחר פרויקט</option>
          {projects.map((project : any) => (
            <option key={project.id} value={JSON.stringify(project)}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
    ) : <div>{currentProject?.missionManagementCredentials?.name ?? ""}</div>
  );
};

export default JiraProjectSelector;