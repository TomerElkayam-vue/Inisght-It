import { useProjectManagementContext } from '../../context/ProjectManagementContext';
import { useSearchParams } from 'react-router-dom';
import { JiraProjectList } from './JiraProjectList';
import { updateJiraProjectOnProject } from '../../services/jira.service';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import { Project } from '@prisma/client';
import GithubProjectSelector from './GithubProjectSelector';
import { updateGithubProject } from '../../services/github.service';

const ToolCredentials = () => {
  const {
    managementCredentials,
    setManagementCredentials: setJiraCredentials,
  } = useProjectManagementContext();

  const { currentProject, setCurrentProject } = useCurrentProjectContext();

  const [searchParams] = useSearchParams();

  const jiraSuccess = searchParams.get('jira-successs');
  const githubSuccess = searchParams.get('github-successs');

  const apiEndpoint = import.meta.env.VITE_API_URL;

  const handleJiraChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = { ...managementCredentials, [field]: e.target.value };
      setJiraCredentials(newValue);
    };

  const redirectToGitHub = () => {
    const clientId = 'Ov23liBqFboVyeJfPkKc';
    const redirectUri = `${apiEndpoint}/github/callback/?projectId=${currentProject?.id}`;
    const scope = 'repo';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  const redirectToJira = () => {
    const clientId = 'At6ejbAFMkAUdSJ25XfbMLSJiMLpxVHe';
    const redirectUri = `${apiEndpoint}/jira/callback?projectId=${currentProject?.id}`;
    const scopes =
      'read:jira-user read:jira-work read:board-scope:jira-software read:project:jira read:board-scope.admin:jira-software read:issue-details:jira read:sprint:jira-software offline_access';

    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${encodeURIComponent(
      scopes
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&prompt=consent`;

    window.location.href = authUrl;
  };

  return (
    <div className="flex items-center justify-center gap-8 bg-[#1e1e2f] text-white">
      <div
        dir="rtl"
        className="bg-[#2e2e3e] p-8 rounded-3xl h-full w-80 text-center shadow-lg"
      >
        <h2 className="h-full text-xl font-bold mb-8">פלטפורמות ניהול</h2>
        <div className="mt-4">
          <button
            className="bg-[#2b3544] text-white px-4 py-2 rounded-lg hover:bg-[#353f4f] transition-colors"
            onClick={redirectToGitHub}
          >
            חבר את גיטהאב
          </button>
        </div>
        <GithubProjectSelector
          githubSuccess={githubSuccess}
          currentProject={currentProject}
          onSelectProject={async (project: string) => {
            const selectedRepo = JSON.parse(project);
            try {
              //@ts-ignore
              setCurrentProject((prev: Project) => ({
                ...prev,
                codeRepositoryCredentials: {
                  //@ts-ignore
                  ...prev.codeRepositoryCredentials,
                  ...selectedRepo
                },
              }));
              await updateGithubProject(currentProject?.id ?? "", selectedRepo);
            } catch (err) {
              console.log(err);
            }
          }}
        />
      </div>

      <div
        dir="rtl"
        className="bg-[#2e2e3e] p-8 rounded-3xl w-80 text-center shadow-lg"
      >
        <h2 className="text-xl font-bold mb-8">כלי ניהול משימות</h2>
        <div className="mt-4">
          {(jiraSuccess && currentProject?.id) ||
          currentProject?.missionManagementCredentials?.name ? (
            // TODO: Retriving the data about the project from the server and check for the selected project and update it
            <JiraProjectList
              projectId={currentProject.id}
              selectedProject={
                currentProject?.missionManagementCredentials || {}
              }
              onSelectProject={async (project: any) => {
                try {
                  //@ts-ignore
                  setCurrentProject((prev: Project) => ({
                    ...prev,
                    missionManagementCredentials: {
                      //@ts-ignore
                      ...prev.missionManagementCredentials,
                      name: project.name,
                    },
                  }));
                  await updateJiraProjectOnProject(currentProject.id, {
                    projectId: project.id,
                    projectName: project.name,
                  });
                } catch (err) {
                  console.log(err);
                }
              }}
            />
          ) : (
            <button
              className="bg-[#2b3544] text-white px-4 py-2 rounded-lg hover:bg-[#353f4f] transition-colors"
              onClick={redirectToJira}
            >
              חבר את JIRA
            </button>
          )}
        </div>
        <div className="mt-4">
          <label className="block mb-2">Board ID</label>
          <input
            type="text"
            value={managementCredentials?.boardId ?? ''}
            onChange={handleJiraChange('boardId')}
            className="w-full p-3 rounded-lg bg-[#3a3a4d] border-none focus:outline-none text-white text-right"
          />
        </div>
      </div>
    </div>
  );
};

export default ToolCredentials;
