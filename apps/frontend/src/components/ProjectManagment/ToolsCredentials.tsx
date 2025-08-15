import { useSearchParams } from 'react-router-dom';
import JiraProjectSelector from './JiraProjectSelector';
import { useCurrentProjectContext } from '../../context/CurrentProjectContext';
import GithubProjectSelector from './GithubProjectSelector';

const ToolCredentials = () => {
  const { currentProject } = useCurrentProjectContext();

  const [searchParams] = useSearchParams();
  const jiraSuccess = searchParams.get('jira-successs');
  const githubSuccess = searchParams.get('github-successs');

  const apiEndpoint = import.meta.env.VITE_API_URL;
  const githubClientId =
    import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23liBqFboVyeJfPkKc';
  const jiraClientId =
    import.meta.env.VITE_JIRA_CLIENT_ID || 'At6ejbAFMkAUdSJ25XfbMLSJiMLpxVHe';

  const redirectToGitHub = () => {
    const redirectUri = `${apiEndpoint}/github/callback/?projectId=${currentProject?.id}`;
    const scope = 'repo';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  const redirectToJira = () => {
    const redirectUri = `${apiEndpoint}/jira/callback?projectId=${currentProject?.id}`;
    const scopes =
      'read:jira-user read:jira-work read:board-scope:jira-software read:project:jira read:board-scope.admin:jira-software read:issue-details:jira read:sprint:jira-software offline_access';

    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${jiraClientId}&scope=${encodeURIComponent(
      scopes
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&prompt=consent`;

    window.location.href = authUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 bg-[#1e1e2f] text-white">
      <div
        dir="rtl"
        className="bg-[#2e2e3e] p-6 rounded-3xl w-[672px] text-center shadow-lg border border-blue-500/20"
      >
        <div className="flex items-center justify-center gap-3">
          <svg
            className="w-5 h-5 text-blue-400 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-base text-gray-200">
            יש לחבר גם כלי בקרת תצורה וגם כלי ניהול משימות
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-8">
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
    </div>
  );
};

export default ToolCredentials;
