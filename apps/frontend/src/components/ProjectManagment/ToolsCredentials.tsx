import { useSearchParams } from 'react-router-dom';
import JiraProjectSelector from './JiraProjectSelector';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import GithubProjectSelector from './GithubProjectSelector';

const ToolCredentials = () => {
  const { currentProject } = useCurrentProjectContext();

  const [searchParams] = useSearchParams();
  const jiraSuccess = searchParams.get('jira-successs');
  const githubSuccess = searchParams.get('github-successs');

  const redirectToGitHub = () => {
    const clientId = 'Ov23liBqFboVyeJfPkKc';
    const redirectUri = `http://localhost:3000/api/github/callback/?projectId=${currentProject?.id}`;
    const scope = 'repo';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  const redirectToJira = () => {
    const clientId = 'At6ejbAFMkAUdSJ25XfbMLSJiMLpxVHe';
    const redirectUri = `http://localhost:3000/api/jira/callback?projectId=${currentProject?.id}`;
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
        <h2 className="h-full text-xl font-bold mb-8">כלי בקרת תצורה</h2>
        <div className="mt-4">
          <button
            className="bg-[#2b3544] text-white px-4 py-2 rounded-lg hover:bg-[#353f4f] transition-colors"
            onClick={redirectToGitHub}
          >
            חבר את Github
          </button>
        </div>
        <div className="mt-4">
          <GithubProjectSelector
            githubSuccess={githubSuccess}
            currentProject={currentProject}
          />
        </div>
      </div>
      <div
        dir="rtl"
        className="bg-[#2e2e3e] p-8 rounded-3xl w-80 text-center shadow-lg"
      >
        <h2 className="text-xl font-bold mb-8">כלי ניהול משימות</h2>
        <div className="mt-4">
          <button
            className="bg-[#2b3544] text-white px-4 py-2 rounded-lg hover:bg-[#353f4f] transition-colors"
            onClick={redirectToJira}
          >
            חבר את Jira
          </button>
        </div>
        <div className="mt-4">
          <JiraProjectSelector
            currentProject={currentProject}
            jiraSuccess={jiraSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default ToolCredentials;
