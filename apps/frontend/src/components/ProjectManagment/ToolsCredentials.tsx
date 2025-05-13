import { useProjectManagementContext } from '../../context/ProjectManagementContext';

const ToolCredentials = () => {
  const {
    codeBaseCredentials,
    setCodeBaseCredentials,
    managementCredentials,
    setManagementCredentials: setJiraCredentials,
  } = useProjectManagementContext();

  const handleGithubChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = { ...codeBaseCredentials, [field]: e.target.value };
      setCodeBaseCredentials(newValue);
    };

  const handleJiraChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = { ...managementCredentials, [field]: e.target.value };
      setJiraCredentials(newValue);
    };

  const redirectToGitHub = () => {
    const clientId = 'Ov23liBqFboVyeJfPkKc';
    const redirectUri =
      'http://localhost:3000/api/github/callback/5189c957-1d16-4880-9e7c-2eec4667dbf2';
    const scope = 'repo';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
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
        <div className="mt-4">
          <label className="block mb-2">Repo Owner</label>
          <input
            type="text"
            value={codeBaseCredentials?.repoOwner ?? ''}
            onChange={handleGithubChange('repoOwner')}
            className="w-full p-3 rounded-lg bg-[#3a3a4d] border-none focus:outline-none text-white text-right"
          />
        </div>
        <div className="mt-4">
          <label className="block mb-2">Repo Name</label>
          <input
            type="text"
            value={codeBaseCredentials?.repoName ?? ''}
            onChange={handleGithubChange('repoName')}
            className="w-full p-3 rounded-lg bg-[#3a3a4d] border-none focus:outline-none text-white text-right"
          />
        </div>
      </div>

      <div
        dir="rtl"
        className="bg-[#2e2e3e] p-8 rounded-3xl w-80 text-center shadow-lg"
      >
        <h2 className="text-xl font-bold mb-8">כלי ניהול משימות</h2>
        <div className="mt-4">
          <label className="block mb-2">Email</label>
          <input
            type="text"
            value={managementCredentials?.email ?? ''}
            onChange={handleJiraChange('email')}
            className="w-full p-3 rounded-lg bg-[#3a3a4d] border-none focus:outline-none text-white text-right"
          />
        </div>
        <div className="mt-4">
          <label className="block mb-2">Jira URL</label>
          <input
            type="text"
            value={managementCredentials?.jiraUrl ?? ''}
            onChange={handleJiraChange('jiraUrl')}
            className="w-full p-3 rounded-lg bg-[#3a3a4d] border-none focus:outline-none text-white text-right"
          />
        </div>
        <div className="mt-4">
          <label className="block mb-2">API Token</label>
          <input
            type="text"
            value={managementCredentials?.apiToken ?? ''}
            onChange={handleJiraChange('apiToken')}
            className="w-full p-3 rounded-lg bg-[#3a3a4d] border-none focus:outline-none text-white text-right"
          />
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
