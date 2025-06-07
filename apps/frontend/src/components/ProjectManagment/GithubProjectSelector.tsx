import { useEffect, useRef, useState } from 'react';
import { getUsersRepositories, updateGithubProject } from '../../services/github.service';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { Project } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';

export type GithubProjectSelectorProps = {
  githubSuccess: string | null;
  currentProject: any;
};

const GithubProjectSelector = ({ githubSuccess, currentProject }: GithubProjectSelectorProps) => {
  const [githubProjects, setGithubProjects] = useState<any[]>([]);
  const [selectedGithubProject, setSelectedGithubProject] = useState<any>(null);
  const { setCurrentProject } = useCurrentProjectContext();
  const [isLoading, setIsLoading] = useState(false);
  const prevRef = useRef(selectedGithubProject);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchData = async () => {
      if (githubSuccess && currentProject?.id && prevRef.current === selectedGithubProject) {
        setIsLoading(true);

        try {
          const {id, name, owner} = currentProject?.codeRepositoryCredentials;
          setSelectedGithubProject(JSON.stringify({id, name, owner}));
        }
        catch {
          setSelectedGithubProject("")
        }

        setGithubProjects(await getUsersRepositories(currentProject.id));
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentProject, selectedGithubProject]);

  useEffect(() => {
    prevRef.current = selectedGithubProject
  }, [selectedGithubProject]);

  const handleSelectProject = async (value: string) => {
    try {
      setSelectedGithubProject(value);
      const selectedRepo = JSON.parse(value);
      //@ts-ignore
      setCurrentProject((prev: Project | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          codeRepositoryCredentials: {
            ...((prev.codeRepositoryCredentials as object) || {}),
            ...selectedRepo,
          },
        };
      });
      await updateGithubProject(currentProject?.id ?? '', selectedRepo);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    isLoading ? (
      <div className="flex justify-center items-center h-11">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    ) : githubProjects.length > 0 ? (
      <div className="mt-4">
        <select
          className="w-full p-3 rounded-lg bg-[#3a3a4d] border-none focus:outline-none text-white text-right"
          value={selectedGithubProject || ''}
          onChange={e => handleSelectProject(e.target.value)}
        >
          <option value="">בחר פרויקט</option>
          {githubProjects.map((project) => (
            <option key={project.id} value={JSON.stringify(project)}>
              {`${project.name} - ${project.owner}`}
            </option>
          ))}
        </select>
      </div>
    ) : <div>{currentProject?.codeRepositoryCredentials?.name ?? ""}</div>
  );
};

export default GithubProjectSelector; 