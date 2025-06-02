import { useEffect, useState } from 'react';
import { getUsersRepositories } from '../../services/github.service';

export type GithubProjectSelectorProps = {
  githubSuccess: string | null;
  currentProject: any;
  onSelectProject: (val: any) => void;
};

const GithubProjectSelector = ({ githubSuccess, currentProject, onSelectProject }: GithubProjectSelectorProps) => {
  const [githubProjects, setGithubProjects] = useState<any[]>([]);
  const [selectedGithubProject] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if ((githubSuccess && currentProject?.id)) {
        setGithubProjects(await getUsersRepositories(currentProject.id));
      }
    };

    fetchData();
  }, [currentProject]);

  return (
    githubProjects.length > 0 ? (
      <div className="mt-4">
        <label className="block mb-2">בחר פרויקט מגיטהאב</label>
        <select
          className="w-full p-3 rounded-lg bg-[#3a3a4d] border-none focus:outline-none text-white text-right"
          value={selectedGithubProject}
          onChange={e => onSelectProject(e.target.value)}
        >
          <option value="">בחר פרויקט</option>
          {githubProjects.map((project) => (
            <option key={project.id} value={JSON.stringify(project)}>
              {`${project.name} - ${project.owner}`}
            </option>
          ))}
        </select>
      </div>) : <div>{currentProject?.codeRepositoryCredentials?.name ?? ""}</div>
  );
};

export default GithubProjectSelector; 