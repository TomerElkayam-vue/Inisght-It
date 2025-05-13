import { useEffect, useState } from 'react';
import { getProjects } from '../../services/jira.service';

type Props = {
  projectId: string;
  selectedProject: { id: string; name: string } & any;
  onSelectProject: { id: string; name: string } & any;
};

export const JiraProjectList = ({
  projectId,
  selectedProject,
  onSelectProject,
}: Props) => {
  const [projects, setProjects] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getProjects(projectId);
        setProjects(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  return !loading ? (
    <ul className="divide-y divide-gray-200 rounded-md border border-gray-300 bg-white shadow-sm">
      {projects.map((project: any) => (
        <li
          key={project.id}
          className="px-4 py-3 hover:bg-gray-50"
          onClick={() => onSelectProject(project)}
          style={{
            cursor: 'grab',
            ...(project.id === selectedProject.id && {
              backgroundColor: 'blue',
            }),
          }}
        >
          <span className="text-gray-800 font-medium">{project.name}</span>
        </li>
      ))}
    </ul>
  ) : (
    <div>Loading Jira Projects...</div>
  );
};
